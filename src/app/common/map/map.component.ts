import {Component} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {MapService} from './map.service';
import {IconType,Location, Marker} from './map.model';
import {MealProvider} from '../meal-provider';

import {
  MapsAPILoader,
  NoOpMapsAPILoader,
  MouseEvent,
  ANGULAR2_GOOGLE_MAPS_PROVIDERS,
  ANGULAR2_GOOGLE_MAPS_DIRECTIVES
} from 'angular2-google-maps/core';

@Component({
  selector: 'map',
  providers: [ANGULAR2_GOOGLE_MAPS_PROVIDERS, MapService],
  directives: [ANGULAR2_GOOGLE_MAPS_DIRECTIVES],
  inputs: ['mealProviders'],
  pipes: [],
  styles: [/*require('./map.component.scss')*/],
  template: require('./map.component.html')
})
export class MapComponent {
  mealProviders: Observable<MealProvider[]>;
  hq: Marker;
  markers: Marker[] = [];

  constructor(private mapService: MapService) {

  }

  ngOnInit() {
    this.hq = this.mapService.getCachedHome();

    this.mealProviders.subscribe((array)=>{
      this.markers = [];
      this.markers.push(this.hq, ...array.map((provider)=> {return {
        name: provider.name,
        address: provider.contacts['address'],
        location: provider.location,
        color: provider.color
      }}));
    })

  }

  public getIconUrl(mealProvider: MealProvider) : string {
    if (mealProvider.name === 'home') {
      return this.mapService.getIconUrl(IconType.HOME, this.hq.color);
    }
    else {
      return this.mapService.getIconUrl(IconType.PROVIDER, mealProvider.color);
    }
  }
}
