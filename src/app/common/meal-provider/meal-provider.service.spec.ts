import {provide, Injector} from '@angular/core';
import {describe, expect, it, xit, inject, async, fakeAsync, beforeEachProviders} from '@angular/core/testing';

import {Observable} from 'rxjs/Rx';

import {MealProvider} from './meal-provider.model.ts';
import {MealProviderService} from './meal-provider.service.ts';
import {MealSetXPath} from '../meal-set';

import {XpathResolutionResult, XpathService} from '../xpath';

import {Location, LocationJSON, Marker, MapService} from '../map';

describe('Test MealProviderService', () => {

  beforeEachProviders(() => {
      return [
          // I don't want to mock everything till the end of the world
          provide(MapService, {useValue: new MapService(null)}),
          MealProviderService,
          XpathService
      ];
    });

    it(' should prepare mock data if no cached providers available', async(inject([MealProviderService], (testService: MealProviderService) => {
        let mealProviders = [];
        spyOn(testService, 'getCachedMealProviders').and.callFake(() => {
          return [];
        });
        spyOn(testService, 'cacheMealProviders').and.callFake((providers) => {
          return mealProviders = providers;
        });
        testService.init();
        expect(mealProviders.length).toBe(2);
        expect(mealProviders[0].name).toBe('Bonnie');
    })));

    it(' don\'t prepare mock data if there are cached provider(s) available', async(inject([MealProviderService], (testService: MealProviderService) => {
        let mealProviders = [new MealProvider('test', null, {}, null, [], null, null)];
        spyOn(testService, 'getCachedMealProviders').and.callFake(() => {
          return [new MealProvider('test', null, {}, null, [], null, null)];
        });
        spyOn(testService, 'cacheMealProviders').and.callFake((providers) => {
          return mealProviders = providers;
        });
        testService.init();
        expect(mealProviders.length).toBe(1);
        expect(mealProviders[0].name).toBe('test');
    })));

    it(' adds new meal provider', async(inject([MealProviderService], (testService: MealProviderService) => {
        let existingProvider = new MealProvider('test', null, {}, null, [], null, null);
        let newProvider = new MealProvider('new', null, {}, null, [], null, null);
        let cachedKey, cachedValue;
        spyOn(testService, 'getCachedMealProviders').and.callFake(() => {
          return [existingProvider];
        });
        spyOn(localStorage, 'setItem').and.callFake((key,value) => {
          cachedKey = key;
          cachedValue = value;
        });
        testService.addMealProvider(newProvider);
        expect(cachedKey).toEqual('mealProviders');
        let cachedValueObj = JSON.parse(cachedValue);
        expect(cachedValueObj instanceof Array).toBe(true);
        expect(cachedValueObj.length).toEqual(2);
        expect(cachedValueObj[0].name).toEqual('test');
        expect(cachedValueObj[1].name).toEqual('new');
    })));

    it(' edits existing meal provider', async(inject([MealProviderService], (testService: MealProviderService) => {
        let existingProvider = new MealProvider('test', 'http://originalpage.com', {'address':'10 Downing St., London'}, null, [], null, null);
        let updatedProvider = new MealProvider('test', 'http://somepage.com', {'phone':'+155555555'}, null, [], null, null);
        let cachedKey, cachedValue;
        spyOn(testService, 'getCachedMealProviders').and.callFake(() => {
          return [existingProvider];
        });
        spyOn(localStorage, 'setItem').and.callFake((key,value) => {
          cachedKey = key;
          cachedValue = value;
        });
        testService.addMealProvider(updatedProvider);
        expect(cachedKey).toEqual('mealProviders');
        let cachedValueObj = JSON.parse(cachedValue);
        expect(cachedValueObj instanceof Array).toBe(true);
        expect(cachedValueObj.length).toEqual(1);
        expect(cachedValueObj[0].name).toEqual('test');
        expect(cachedValueObj[0].homePage).toEqual('http://somepage.com');
        expect(cachedValueObj[0].contacts).toEqual({'phone':'+155555555'});
    })));

    it(' removes existing meal provider', async(inject([MealProviderService], (testService: MealProviderService) => {
        let existingProvider1 = new MealProvider('existing1', 'http://existingpage1.com', {'address':'10 Downing St., London'}, null, [], null, null);
        let existingProvider2 = new MealProvider('existing2', 'http://existingpage2.com', {'phone':'+155555555'}, null, [], null, null);
        let providerToDelete = new MealProvider('existing2', 'http://somepage.com', {'email':'existing2@somepage.com'}, null, [], null, null);
        let cachedKey, cachedValue;
        spyOn(testService, 'getCachedMealProviders').and.callFake(() => {
          return [existingProvider1, existingProvider2];
        });
        spyOn(localStorage, 'setItem').and.callFake((key,value) => {
          cachedKey = key;
          cachedValue = value;
        });
        testService.removeMealProvider(providerToDelete);
        expect(cachedKey).toEqual('mealProviders');
        let cachedValueObj = JSON.parse(cachedValue);
        expect(cachedValueObj instanceof Array).toBe(true);
        expect(cachedValueObj.length).toEqual(1);
        expect(cachedValueObj[0].name).toEqual('existing1');
        expect(cachedValueObj[0].homePage).toEqual('http://existingpage1.com');
        expect(cachedValueObj[0].contacts).toEqual({'address':'10 Downing St., London'});
    })));

    it(' removes non-existing meal provider', async(inject([MealProviderService], (testService: MealProviderService) => {
        let existingProvider1 = new MealProvider('existing1', 'http://existingpage1.com', {'address':'10 Downing St., London'}, null, [], null, null);
        let existingProvider2 = new MealProvider('existing2', 'http://existingpage2.com', {'phone':'+155555555'}, null, [], null, null);
        let providerToDelete = new MealProvider('nonexisting', 'http://somepage.com', {'email':'existing2@somepage.com'}, null, [], null, null);
        let cachedKey, cachedValue;
        spyOn(testService, 'getCachedMealProviders').and.callFake(() => {
          return [existingProvider1, existingProvider2];
        });
        spyOn(localStorage, 'setItem').and.callFake((key,value) => {
          cachedKey = key;
          cachedValue = value;
        });
        testService.removeMealProvider(providerToDelete);
        expect(cachedKey).toEqual('mealProviders');
        let cachedValueObj = JSON.parse(cachedValue);
        expect(cachedValueObj instanceof Array).toBe(true);
        expect(cachedValueObj.length).toEqual(2);
        expect(cachedValueObj[0].name).toEqual('existing1');
        expect(cachedValueObj[0].homePage).toEqual('http://existingpage1.com');
        expect(cachedValueObj[0].contacts).toEqual({'address':'10 Downing St., London'});
        expect(cachedValueObj[1].name).toEqual('existing2');
        expect(cachedValueObj[1].homePage).toEqual('http://existingpage2.com');
        expect(cachedValueObj[1].contacts).toEqual({'phone':'+155555555'});
    })));

    it(' caches meal providers', async(inject([MealProviderService], (testService: MealProviderService) => {
        let provider1 = new MealProvider('existing1', 'http://existingpage1.com', {'address':'10 Downing St., London'}, null, [], null, null);
        let provider2 = new MealProvider('existing2', 'http://existingpage2.com', {'phone':'+155555555'}, null, [], null, null);
        let cachedKey, cachedValue;
        spyOn(localStorage, 'setItem').and.callFake((key,value) => {
          cachedKey = key;
          cachedValue = value;
        });
        testService.cacheMealProviders([provider1, provider2]);
        expect(cachedKey).toEqual('mealProviders');
        let cachedValueObj = JSON.parse(cachedValue);
        expect(cachedValueObj instanceof Array).toBe(true);
        expect(cachedValueObj.length).toEqual(2);
        expect(cachedValueObj[0].name).toEqual('existing1');
        expect(cachedValueObj[0].homePage).toEqual('http://existingpage1.com');
        expect(cachedValueObj[0].contacts).toEqual({'address':'10 Downing St., London'});
        expect(cachedValueObj[1].name).toEqual('existing2');
        expect(cachedValueObj[1].homePage).toEqual('http://existingpage2.com');
        expect(cachedValueObj[1].contacts).toEqual({'phone':'+155555555'});
    })));

    it(' returns cached meal providers', async(inject([MealProviderService], (testService: MealProviderService) => {
        let provider1 = new MealProvider('existing1', 'http://existingpage1.com', {'address':'10 Downing St., London'}, null, [], null, null);
        let provider2 = new MealProvider('existing2', 'http://existingpage2.com', {'phone':'+155555555'}, null, [], null, null);
        let cachedKey;
        spyOn(localStorage, 'getItem').and.callFake((key) => {
          cachedKey = key;
          return JSON.stringify([provider1, provider2]);
        });
        let mealProviders = testService.getCachedMealProviders();
        expect(cachedKey).toEqual('mealProviders');

        expect(mealProviders instanceof Array).toBe(true);
        expect(mealProviders.length).toEqual(2);
        expect(mealProviders[0].name).toEqual('existing1');
        expect(mealProviders[0].homePage).toEqual('http://existingpage1.com');
        expect(mealProviders[0].contacts).toEqual({'address':'10 Downing St., London'});
        expect(mealProviders[1].name).toEqual('existing2');
        expect(mealProviders[1].homePage).toEqual('http://existingpage2.com');
        expect(mealProviders[1].contacts).toEqual({'phone':'+155555555'});
    })));

    it(' returns no meal providers if no cached entries are present', async(inject([MealProviderService], (testService: MealProviderService) => {
        let cachedKey;
        spyOn(localStorage, 'getItem').and.callFake((key) => {
          cachedKey = key;
          return undefined;
        });
        let mealProviders = testService.getCachedMealProviders();
        expect(cachedKey).toEqual('mealProviders');

        expect(mealProviders instanceof Array).toBe(true);
        expect(mealProviders.length).toEqual(0);
    })));

    it(' returns daily meals grouped by meal providers with meal sets if they can be loaded',
      async(inject([MealProviderService, XpathService, MapService], (testService: MealProviderService, xpathService: XpathService, mapService: MapService) => {
        let existingProvider1 = createMealProvider1();
        let existingProvider2 = createMealProvider2();
        let cachedMealProvidersSpy = spyOn(testService, 'getCachedMealProviders').and.callFake(() => {
          return [existingProvider1, existingProvider2];
        });
        let loadAndResolveXPathsSpy = spyOn(xpathService, 'loadAndResolveXPaths').and.callFake(generateFakeXpathResult);
        let calculateDistanceSpy = spyOn(mapService, 'calculateDistance').and.callFake(generateFakeDistance);
        let mealProviderObservables = testService.getDailyMealsByMealProviders();
        expect(cachedMealProvidersSpy).toHaveBeenCalled();
        expect(loadAndResolveXPathsSpy.calls.count()).toEqual(2);
        expect(loadAndResolveXPathsSpy.calls.argsFor(0)).toEqual(['http://existingpage1.com/daily-meal',
          '//a[1]', '//a[2]', '//a[3]', '//a[4]', '//a[5]', '//a[6]',
          '//b[1]', '//b[2]', '//b[3]', '//b[4]', '//b[5]']);
        expect(loadAndResolveXPathsSpy.calls.argsFor(1)).toEqual(['http://existingpage2.com/menu',
          '//a[1]', '//a[2]', '//a[3]', '//a[4]', '//a[5]']);
        expect(calculateDistanceSpy.calls.count()).toEqual(2);
        expect(calculateDistanceSpy.calls.argsFor(0)[0].lat).toEqual(19);
        expect(calculateDistanceSpy.calls.argsFor(0)[1].lat).toEqual(15);
        expect(calculateDistanceSpy.calls.argsFor(1)[0].lat).toEqual(20);
        expect(calculateDistanceSpy.calls.argsFor(1)[1].lat).toEqual(15);
        mealProviderObservables.subscribe(data => {
          expect(data.length).toEqual(2);
          expect(data[0]).not.toBeNull();
          expect(data[0].name).toEqual(existingProvider1.name);
          expect(data[0].distance)
        });
    })));

});

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
    '999900'
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
    '00cccc'
  );
}

function generateFakeXpathResult(url, ...xpaths):Observable<XpathResolutionResult> {
    let xpathResult:{[key:string]:string} = {};
    if (url.indexOf('page1') >= 0) {
      xpathResult['//a[1]'] = 'menu1';
      xpathResult['//a[2]'] = '1500 HUF';
      xpathResult['//a[3]'] = 'antipasto';
      xpathResult['//a[4]'] = 'primo piatto';
      xpathResult['//a[5]'] = 'secondo piatto';
      xpathResult['//a[6]'] = 'panna cotta';

      xpathResult['//b[1]'] = 'menu2';
      xpathResult['//b[2]'] = '2000 HUF';
      xpathResult['//b[3]'] = 'soup';
      xpathResult['//b[4]'] = 'fish';
      xpathResult['//b[5]'] = 'dessert';
    }
    else if (url.indexOf('page2') >= 0) {
      xpathResult['//a[1]'] = 'menu3';
      xpathResult['//a[2]'] = '1200 HUF';
      xpathResult['//a[3]'] = 'Suppe';
      xpathResult['//a[4]'] = 'Wiener Schnitzel';
      xpathResult['//a[5]'] = 'Schokopuding';
    }
    return Observable.of({
      url: url,
      xpathResult: xpathResult
    });
}

function generateFakeHome(): Marker {
  return new Marker('home', 'address', new Location(15,15), '555555');
}

function generateFakeDistance(providerLocation: LocationJSON, homeLocation: LocationJSON): number {
    return providerLocation.lat - homeLocation.lat;
}
