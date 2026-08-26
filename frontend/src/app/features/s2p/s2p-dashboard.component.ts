import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { S2pService, Listing, ListingCategory } from './s2p.service';
import { MapComponent } from '../../shared/map/map.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-s2p-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, MapComponent],
    templateUrl: './s2p-dashboard.component.html',
})
export class S2pDashboardComponent implements OnInit {
    listings = signal<Listing[]>([]);
    center = signal<[number, number]>([76.9286, 43.2389]);
    selectedCategory = signal<ListingCategory | 'all'>('all');
    viewMode = signal<'nearby' | 'mine'>('nearby');

    showCreateForm = signal(false);
    locationMode = signal<'business' | 'charity' | null>(null);
    businessPoint = signal<[number, number] | null>(null);
    charityPoint = signal<[number, number] | null>(null);
    routeCoordinates = signal<[number, number][]>([]);
    routeDistance = signal<number | null>(null);
    pickedAddress = signal('');
    createError = signal('');

    category: ListingCategory = 'ready_food';
    title = '';
    description = '';
    foodType = '';
    quantity = '';
    pickupStart = '';
    pickupEnd = '';
    partnerFacility = '';
    charityPhone = '';
    address = '';
    businessAddress = '';
    charityAddress = '';

    editingId = signal<number | null>(null);
    editTitle = '';
    editQuantity = '';
    editPartnerFacility = '';

    constructor(private s2pService: S2pService, public auth: AuthService) {}

    ngOnInit(): void {
        navigator.geolocation.getCurrentPosition(
            pos => {
                this.center.set([pos.coords.longitude, pos.coords.latitude]);
                this.loadListings();
            },
            () => this.loadListings()
        );
    }

    private loadListings(): void {
        const [lng, lat] = this.center();
        this.s2pService.getListings({
            lat, lng,
            category: this.selectedCategory(),
            mine: this.viewMode() === 'mine',
        }).subscribe({
            next: data => {
                this.listings.set(data);
            },
            error: err => console.error('Ошибка загрузки:', err),
        });
    }

    setCategory(cat: ListingCategory | 'all'): void {
        this.selectedCategory.set(cat);
        this.loadListings();
    }

    setViewMode(mode: 'nearby' | 'mine'): void {
        this.viewMode.set(mode);
        this.loadListings();
    }

    claim(id: number): void {
        this.s2pService.claim(id).subscribe({
            next: () => this.loadListings(),
            error: err => console.error('Ошибка бронирования:', err),
        });
    }

    completePickup(id: number): void {
        this.s2pService.complete(id).subscribe({
            next: () => this.loadListings(),
            error: err => alert(err.error?.detail || 'Не удалось подтвердить получение'),
        });
    }

    isMine(listing: Listing): boolean {
        return listing.business === this.auth.getUserId();
    }

    toggleCreateForm(): void {
        this.showCreateForm.update(v => !v);
        if (!this.showCreateForm()) this.resetCreateForm();
    }

    chooseLocationMode(mode: 'business' | 'charity'): void {
        this.locationMode.set(mode);
        this.address = mode === 'business' ? this.businessAddress : this.charityAddress;
        this.pickedAddress.set('');
    }

    findAddress(): void {
        this.createError.set('');
        this.s2pService.geocodeAddress(this.address).subscribe({
            next: res => {
                const point: [number, number] = [res.longitude, res.latitude];
                if (this.locationMode() === 'business') {
                    this.businessPoint.set(point);
                    this.businessAddress = this.address;
                } else {
                    this.charityPoint.set(point);
                    this.charityAddress = this.address;
                }
                this.pickedAddress.set(res.address);
                this.center.set([res.longitude, res.latitude]);
                this.loadRoute();
            },
            error: () => this.createError.set('Адрес не найден - уточните адрес'),
        });
    }

    onMapPicked(loc: { lat: number; lng: number }): void {
        const point: [number, number] = [loc.lng, loc.lat];
        if (this.locationMode() === 'business') this.businessPoint.set(point);
        if (this.locationMode() === 'charity') this.charityPoint.set(point);
        this.pickedAddress.set('Определяем адрес...');
        this.s2pService.reverseGeocode(loc.lat, loc.lng).subscribe({
            next: res => this.pickedAddress.set(res.address),
            error: () => this.pickedAddress.set('Не удалось определить адрес для этой точки'),
        });
        this.loadRoute();
    }

    private loadRoute(): void {
        const business = this.businessPoint();
        const charity = this.charityPoint();
        if (!business || !charity) {
            this.routeCoordinates.set([]);
            return;
        }
        this.s2pService.getRoute(business, charity).subscribe({
            next: route => {
                this.routeCoordinates.set(route.coordinates);
                this.routeDistance.set(route.distance_m);
            },
            error: () => {
                this.routeCoordinates.set([]);
                this.routeDistance.set(null);
                this.createError.set('Не удалось построить маршрут по дорогам');
            },
        });
    }

    submitListing(): void {
        const businessPoint = this.businessPoint();
        const charityPoint = this.charityPoint();
        if (!businessPoint || !charityPoint) {
            this.createError.set('Укажите адрес бизнеса и адрес получателя');
            return;
        }
        if (!this.title.trim()) {
            this.createError.set('Укажите заголовок объявления');
            return;
        }
        if (!this.quantity.trim()) {
            this.createError.set('Укажите количество');
            return;
        }
        const [lng, lat] = businessPoint;
        this.s2pService.createListing({
            category: this.category,
            title: this.title.trim(),
            description: this.description,
            food_type: this.foodType,
            quantity: this.quantity.trim(),
            pickup_window_start: this.toIsoDateTime(this.pickupStart),
            pickup_window_end: this.toIsoDateTime(this.pickupEnd),
            partner_facility: this.partnerFacility,
            charity_phone: this.charityPhone,
            latitude: lat,
            longitude: lng,
            charity_latitude: charityPoint[1],
            charity_longitude: charityPoint[0],
        }).subscribe({
            next: () => {
                this.resetCreateForm();
                this.showCreateForm.set(false);
                this.loadListings();
            },
            error: err => this.createError.set(this.getCreateError(err)),
        });
    }

    private toIsoDateTime(value: string): string | null {
        if (!value) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }

    private getCreateError(error: { error?: Record<string, string[] | string> }): string {
        const details = error.error;
        if (details && typeof details === 'object') {
            const message = Object.entries(details)
                .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : value}`)
                .join('; ');
            if (message) return message;
        }
        return 'Не удалось создать объявление - проверьте поля';
    }

    startEdit(listing: Listing): void {
        this.editingId.set(listing.id);
        this.editTitle = listing.title;
        this.editQuantity = listing.quantity;
        this.editPartnerFacility = listing.partner_facility;
    }

    cancelEdit(): void {
        this.editingId.set(null);
    }

    saveEdit(id: number): void {
        this.s2pService.updateListing(id, {
            title: this.editTitle,
            quantity: this.editQuantity,
            partner_facility: this.editPartnerFacility,
        }).subscribe({
            next: () => {
                this.editingId.set(null);
                this.loadListings();
            },
            error: err => console.error('Ошибка сохранения:', err),
        });
    }

    deleteListing(id: number): void {
        if (!confirm('Удалить объявление?')) return;
        this.s2pService.deleteListing(id).subscribe({
            next: () => this.loadListings(),
            error: err => console.error('Ошибка удаления:', err),
        });
    }

    private resetCreateForm(): void {
        this.category = 'ready_food';
        this.title = '';
        this.description = '';
        this.foodType = '';
        this.quantity = '';
        this.pickupStart = '';
        this.pickupEnd = '';
        this.partnerFacility = '';
        this.charityPhone = '';
        this.address = '';
        this.businessAddress = '';
        this.charityAddress = '';
        this.locationMode.set(null);
        this.businessPoint.set(null);
        this.charityPoint.set(null);
        this.routeCoordinates.set([]);
        this.routeDistance.set(null);
        this.pickedAddress.set('');
        this.createError.set('');
    }

    categoryLabel(cat: string): string {
        if (cat === 'ready_food') return 'Готовая еда';
        if (cat === 'repurpose') return 'На переработку';
        if (cat === 'storage') return 'На временное хранение';
        return cat;
    }
}