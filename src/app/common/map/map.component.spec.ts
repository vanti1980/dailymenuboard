import {
  inject,
  TestBed,
  async,
  fakeAsync
} from '@angular/core/testing';

import {Injector} from '@angular/core';

import {Observable} from 'rxjs/Rx';

import {MealSetXPath} from '../meal-set';

import {EmitterService} from '../../core/event';
import {XpathResolutionResult, XpathService} from '../../core/xpath';

import {Location, LocationJSON, Marker, MapComponent, MapService} from './index';

describe('Test MapComponent', () => {

  beforeEach(() => TestBed.configureTestingModule({
      providers: [
        {
          provide: MapService,
          useValue: new MapService(void 0)
        },
        EmitterService,
        MapComponent
      ]})
    );

    it(' should initialize home marker', inject([MapComponent, MapService], (testComponent: MapComponent, mapService: MapService) => {
        spyOn(mapService, 'getCachedHome').and.callFake(generateFakeHome);
        testComponent.ngOnInit();
        expect(testComponent.hq).toEqual(generateFakeHome());
        expect(testComponent.markers).toEqual([generateFakeHome()]);
    }));
});

function generateFakeHome(): Marker {
  return new Marker('home', 'address', new Location(15,15), '555555');
}
