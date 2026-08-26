import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { load } from '@2gis/mapgl';
import { Listing } from '../../features/s2p/s2p.service';
import { GIS_2GIS_KEY } from '../../core/config';

@Component({
    selector: 'app-map',
    standalone: true,
    template: `<div #mapContainer class="map-container"></div>`,
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
    @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;
    @Input() listings: Listing[] = [];
    @Input() singleMarker: [number, number] | null = null;
    @Input() businessPoint: [number, number] | null = null;
    @Input() charityPoint: [number, number] | null = null;
    @Input() routeCoordinates: [number, number][] = [];
    @Input() center: [number, number] = [76.9286, 43.2389];
    @Input() pickable = false;
    @Output() locationPicked = new EventEmitter<{ lat: number; lng: number }>();

    private map: any;
    private mapglInstance: any;
    private markers: any[] = [];
    private routeLine: any;

    ngAfterViewInit(): void {
        load().then(mapgl => {
            this.mapglInstance = mapgl;
            this.map = new mapgl.Map(this.mapContainer.nativeElement, {
                center: this.center,
                zoom: 13,
                key: GIS_2GIS_KEY,
            });
            this.map.on('click', (e: any) => {
                if (this.pickable) {
                    const [lng, lat] = e.lngLat;
                    this.locationPicked.emit({ lat, lng });
                }
            });
            this.renderMarkers();
        });
    }

    ngOnChanges(): void {
        if (this.map && this.mapglInstance) {
            this.renderMarkers();
            this.map.setCenter(this.center);
        }
    }

    private renderMarkers(): void {
        this.markers.forEach(m => m.destroy());
        this.markers = this.listings.map(l =>
            new this.mapglInstance.Marker(this.map, { coordinates: [l.longitude, l.latitude] })
        );
        if (this.businessPoint) {
            this.markers.push(new this.mapglInstance.Marker(this.map, { coordinates: this.businessPoint }));
        }
        if (this.charityPoint) {
            this.markers.push(new this.mapglInstance.Marker(this.map, { coordinates: this.charityPoint }));
        }
        if (this.singleMarker) {
            this.markers.push(new this.mapglInstance.Marker(this.map, { coordinates: this.singleMarker }));
        }
        this.routeLine?.destroy();
        if (this.routeCoordinates.length > 1) {
            this.routeLine = new this.mapglInstance.Polyline(this.map, {
            coordinates: this.routeCoordinates,
                color: '#d95f2b',
                width: 4,
            });
        }
    }

    ngOnDestroy(): void {
        this.markers.forEach(m => m.destroy());
        this.routeLine?.destroy();
        this.map?.destroy();
    }
}