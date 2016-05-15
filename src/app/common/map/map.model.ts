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

export interface Location {
  lat: number;
  lng: number;
}

export interface Viewport {
  northeast: Location;
  southwest: Location;
}

export interface Marker {
  name: string;
  address: string,
  location: Location;
  color: string;
}

export enum IconType {
  HOME, PROVIDER
}
