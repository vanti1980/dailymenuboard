import {provide, Injector} from '@angular/core';
import {describe, expect, it, xit, inject, async, fakeAsync, beforeEachProviders} from '@angular/core/testing';

import {Observable} from 'rxjs/Rx';

import {MealSetXPath} from '../meal-set';

import {XpathResolutionResult, XpathService} from '../xpath';

import {Location, LocationJSON, Marker, MapComponent, MapService} from './index';

describe('Test MapComponent', () => {

  beforeEachProviders(() => {
      return [
        provide(MapService, {useValue: new MapService(undefined)}),
        MapComponent
      ];
    });

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
