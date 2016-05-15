import {Injectable} from '@angular/core';

import {Http} from '@angular/http';
import {Observable} from 'rxjs/Rx';

import {GeoCodeResponse, Location, IconType} from './map.model.ts';

const KEY_HOME = 'home';

@Injectable()
export class MapService {
    constructor(private http: Http) {
        //TODO remove when it can be specified using UI
        this.cacheHome({ lat: 47.4933, lng: 19.0578 });
    }

    public cacheHome(location: Location) {
        localStorage.setItem(KEY_HOME, JSON.stringify(location));
    }

    public getCachedHome(): Location {
        var homeString = localStorage.getItem(KEY_HOME);
        if (homeString) {
            try {
                return <Location>JSON.parse(homeString);
            }
            catch (e) {
                console.log(e);
            }
        }
        return null;
    }

    public getIconUrl(type: IconType, color: string): string {
        var iconId = this.getIconIdForType(type);
        return `${process.env.GCHARTS_ICON_SERVICE}${iconId}|${color}`;
    }

    private getIconIdForType(type: IconType) {
        switch (type) {
            case IconType.HOME:
                return "?chst=d_map_pin_icon&chld=home";
            default:
                return "?chst=d_map_pin_letter&chld=%E2%80%A2";
        }
    }

    public getLocation(address: string): Observable<Location> {
        return this.http.get(`${process.env.GEOCODE_SERVICE}?address=${encodeURI(address)}&sensor=false`)
            .map((res) => <GeoCodeResponse>res.json())
            .map((geoResp) => geoResp.results[0].geometry.location);
    }
}
