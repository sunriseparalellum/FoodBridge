import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ListingCategory = 'ready_food' | 'repurpose' | 'storage';

export interface Listing {
    id: number;
    business: number;
    category: ListingCategory;
    title: string;
    description: string;
    food_type: string;
    quantity: string;
    pickup_window_start: string | null;
    pickup_window_end: string | null;
    partner_facility: string;
    latitude: number;
    longitude: number;
    distance_km: number | null;
    is_claimed_by_me: boolean;
    status: string;
}

@Injectable({ providedIn: 'root' })
export class S2pService {
    private baseUrl = 'http://127.0.0.1:8000/api/s2p';

    constructor(private http: HttpClient) {}

    getListings(params: { lat?: number; lng?: number; category?: ListingCategory | 'all'; mine?: boolean }): Observable<Listing[]> {
        const query = new URLSearchParams();
        if (params.lat != null) query.set('lat', String(params.lat));
        if (params.lng != null) query.set('lng', String(params.lng));
        if (params.category && params.category !== 'all') query.set('category', params.category);
        if (params.mine) query.set('mine', 'true');
        return this.http.get<Listing[]>(`${this.baseUrl}/listings/?${query.toString()}`);
    }

    createListing(listing: Partial<Listing>): Observable<Listing> {
        return this.http.post<Listing>(`${this.baseUrl}/listings/`, listing);
    }

    updateListing(id: number, listing: Partial<Listing>): Observable<Listing> {
        return this.http.patch<Listing>(`${this.baseUrl}/listings/${id}/`, listing);
    }

    deleteListing(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/listings/${id}/`);
    }

    claim(id: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/listings/${id}/claim/`, {});
    }

    complete(id: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/listings/${id}/complete/`, {});
    }

    geocodeAddress(address: string): Observable<{ latitude: number; longitude: number; address: string }> {
        return this.http.get<{ latitude: number; longitude: number; address: string }>(
            `${this.baseUrl}/geocode/?address=${encodeURIComponent(address)}`
        );
    }

    reverseGeocode(lat: number, lng: number): Observable<{ address: string }> {
        return this.http.get<{ address: string }>(`${this.baseUrl}/reverse-geocode/?lat=${lat}&lon=${lng}`);
    }
}