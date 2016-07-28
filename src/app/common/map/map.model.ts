import { deserialize, deserializeAs, serialize, serializeAs } from 'cerialize';

export interface GeoCodeResponseJSON {
  results: Array<GeoCodeResultJSON>;
  status: string;
}

export interface GeoCodeResultJSON {
  address_components: Array<AddressComponentJSON>;
  formatted_address: string;
  geometry: GeometryJSON;
  place_id: string;
  types: Array<string>;
}

export interface AddressComponentJSON {
  long_name: string;
  short_name: string;
  types: Array<string>;
}

export interface GeometryJSON {
  location: Location;
  location_type: string;
  viewport: ViewportJSON;
}

export interface LocationJSON {
  lat: number;
  lng: number;
}

export interface ViewportJSON {
  northeast: LocationJSON;
  southwest: LocationJSON;
}

export interface MarkerJSON {
  name: string;
  address: string;
  location: LocationJSON;
  color: string;
}

export enum IconType {
  HOME, PROVIDER
}

export class Location implements LocationJSON {
  @serialize @deserialize
  lat: number;

  @serialize @deserialize
  lng: number;

  constructor(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  }
}

export class Marker implements MarkerJSON {
  @serialize @deserialize
  name: string;

  @serialize @deserialize
  address: string;

  @serializeAs(Location) @deserializeAs(Location)
  location: Location;

  @serialize @deserialize
  color: string;

  constructor(
    name: string,
    address: string,
    location: Location,
    color: string
  ) {
    this.name = name;
    this.address = address;
    this.location = location;
    this.color = color;
  }
}
