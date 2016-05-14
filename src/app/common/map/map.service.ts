import {Injectable} from '@angular/core';

import {Http} from '@angular/http';
import {Observable} from 'rxjs/Rx';

import {GeoCodeResponse, Location} from './map.model.ts';

@Injectable()
export class MapService {
  constructor(private http:Http) {

  }

  public getLocation(address: string) : Observable<Location> {
    return this.http.get(`${process.env.GEOCODE_SERVICE}?address=${encodeURI(address)}&sensor=false`)
      .map((res) => <GeoCodeResponse>res.json())
      .map((geoResp) => geoResp.results[0].geometry.location);
  }
}
