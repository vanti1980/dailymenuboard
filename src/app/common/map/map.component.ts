import {Component, Input, OnChanges, SimpleChange} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {MapService} from './map.service';
import {IconType,Location, Marker} from './map.model';
import {MealProvider} from '../meal-provider';

import {EmitterService, Events} from '../../core/event';

@Component({
  selector: 'map',
  styles: [/*require('./map.component.scss')*/],
  template: require('./map.component.html')
})
export class MapComponent implements OnChanges {
  @Input() mealProviders: MealProvider[];
  hq: Marker;
  markers: Marker[] = [];

  private eventSubscriptions: {[key: number]:any} = {};

  constructor(
    private emitterService: EmitterService,
    private mapService: MapService) {

  }

  ngOnInit() {
    this.eventSubscriptions[Events.HOME_CHANGED] = this.emitterService.get(Events.HOME_CHANGED).subscribe(msg =>{
      this.initHq();
    });

    this.initHq();
  }

  ngOnDestroy() {
    this.eventSubscriptions[Events.HOME_CHANGED].unsubscribe();
  }

  private initHq():void {
    this.hq = this.mapService.getCachedHome();
    if (this.markers.length === 0) {
      this.markers = [this.hq];
    }
    else {
      this.markers[0] = this.hq;
    }
  }

  ngOnChanges(changes: {[propName: string]: SimpleChange}) {
    if (changes['mealProviders']) {
      this.markers = [];
      this.markers.push(this.hq, ...changes['mealProviders'].currentValue
        .filter((provider)=>provider && provider.location != null)
        .map((provider)=> {
          return new Marker(provider.name, provider.contacts['address'], provider.location, provider.color);
        })
      );
    }
  }

  public getIconUrl(mealProvider: MealProvider) : string {
    if (mealProvider.name === 'home') {
      return this.mapService.getIconUrl(IconType.HOME, this.hq.color);
    }
    else {
      return this.mapService.getIconUrl(IconType.PROVIDER, mealProvider.color);
    }
  }

  mapClicked($event: Event) {

  }
}
