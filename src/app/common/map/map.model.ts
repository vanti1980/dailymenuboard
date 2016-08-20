import {Marker} from './marker.model.ts';

import {Location} from './location.model';
import {Color} from '../color';

export interface GeoCodeResponse {
    results: Array<GeoCodeResult>;
    status: string;
}

export interface GeoCodeResult {
    address_components: Array<AddressComponent>;
    formatted_address: string;
    geometry: Geometry;
    place_id: string;
    types: Array<string>;
}

export interface AddressComponent {
    long_name: string;
    short_name: string;
    types: Array<string>;
}

export interface Geometry {
    location: Location;
    location_type: string;
    viewport: Viewport;
}

export interface Viewport {
    northeast: Location;
    southwest: Location;
}

export enum IconType {
    HOME, PROVIDER
}
