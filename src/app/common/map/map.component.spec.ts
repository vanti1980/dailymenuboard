import {
  inject,
  TestBed,
  async,
  fakeAsync
} from '@angular/core/testing';

import {Injector, SimpleChange} from '@angular/core';

import {Observable} from 'rxjs/Rx';

import {MealProvider} from '../meal-provider';
import {MealSetXPath} from '../meal-set';

import {EmitterService, Events} from '../../core/event';

import {IconType, Location, LocationJSON, Marker, MapComponent, MapService} from './index';

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

    it(' should update markers when home change event has been fired',
      inject([MapComponent, MapService, EmitterService], (testComponent: MapComponent, mapService: MapService, emitterService: EmitterService) => {
        const spy = spyOn(mapService, 'getCachedHome');
        spy.and.callFake(generateFakeHome);
        testComponent.ngOnInit();
        spy.and.callFake(generateFakeHome2);
        emitterService.get(Events.HOME_CHANGED).emit(void 0);
        expect(testComponent.hq).toEqual(generateFakeHome2());
        expect(testComponent.markers).toEqual([generateFakeHome2()]);
    }));

    it(' should update markers when meal providers have been changed', inject([MapComponent, MapService], (testComponent: MapComponent, mapService: MapService) => {
        spyOn(mapService, 'getCachedHome').and.callFake(generateFakeHome);
        testComponent.ngOnInit();
        const mealProviders = [createMealProvider1(), createMealProvider2()];
        testComponent.ngOnChanges({mealProviders: new SimpleChange(void 0, mealProviders)});
        expect(testComponent.markers).toEqual([generateFakeHome(),
            new Marker('existing1', '10 Downing St., London', new Location(19,49), '999900'),
            new Marker('existing2', void 0, new Location(20,40), '00cccc')
        ]);
    }));

    it(' should call getIconUrl on service with the given color for home provider', inject([MapComponent, MapService], (testComponent: MapComponent, mapService: MapService) => {
      const getIconUrlSpy = spyOn(mapService, 'getIconUrl');
      testComponent.hq = new Marker('home', void 0, void 0, '777777');
      testComponent.getIconUrl(new MealProvider('home', void 0, void 0, void 0, void 0, void 0, void 0, 0));
      expect(getIconUrlSpy).toHaveBeenCalled();
      expect(getIconUrlSpy.calls.first().args[0]).toEqual(IconType.HOME);
      expect(getIconUrlSpy.calls.first().args[1]).toEqual('777777');
    }));

    it(' should call getIconUrl on service with the given color for other providers', inject([MapComponent, MapService], (testComponent: MapComponent, mapService: MapService) => {
      const getIconUrlSpy = spyOn(mapService, 'getIconUrl');
      testComponent.getIconUrl(createMealProvider1());
      expect(getIconUrlSpy).toHaveBeenCalled();
      expect(getIconUrlSpy.calls.first().args[0]).toEqual(IconType.PROVIDER);
      expect(getIconUrlSpy.calls.first().args[1]).toEqual('999900');
    }));

});

function generateFakeHome(): Marker {
  return new Marker('home', 'address', new Location(15,15), '555555');
}

function generateFakeHome2(): Marker {
  return new Marker('home2', 'address2', new Location(16,16), '666666');
}

function createMealProvider1(): MealProvider {
  return new MealProvider(
    'existing1',
    'http://existingpage1.com',
    {'address':'10 Downing St., London'},
    'http://existingpage1.com/daily-meal',
    [
      new MealSetXPath('//a[1]', '//a[2]', ['//a[3]', '//a[4]', '//a[5]', '//a[6]']),
      new MealSetXPath('//b[1]', '//b[2]', ['//b[3]', '//b[4]', '//b[5]'])
    ],
    new Location(19, 49),
    '999900',
    0
  );
}

function createMealProvider2(): MealProvider {
  return new MealProvider(
    'existing2',
    'http://existingpage2.com',
    {'phone':'+155555555'},
    'http://existingpage2.com/menu',
    [
      new MealSetXPath('//a[1]', '//a[2]', ['//a[3]', '//a[4]', '//a[5]'])
    ],
    new Location(20, 40),
    '00cccc',
    1
  );
}
