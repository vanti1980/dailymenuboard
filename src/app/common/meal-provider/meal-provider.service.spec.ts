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
          provide(MapService, {useValue: new MapService(undefined)}),
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
        let mealProviders = [new MealProvider('test', undefined, {}, undefined, [], undefined, undefined, 0)];
        spyOn(testService, 'getCachedMealProviders').and.callFake(() => {
          return [new MealProvider('test', undefined, {}, undefined, [], undefined, undefined, 0)];
        });
        spyOn(testService, 'cacheMealProviders').and.callFake((providers) => {
          return mealProviders = providers;
        });
        testService.init();
        expect(mealProviders.length).toBe(1);
        expect(mealProviders[0].name).toBe('test');
    })));

    it(' adds new meal provider', async(inject([MealProviderService], (testService: MealProviderService) => {
        let existingProvider = new MealProvider('test', undefined, {}, undefined, [], undefined, undefined, 0);
        let newProvider = new MealProvider('new', undefined, {}, undefined, [], undefined, undefined, 0);
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
        let existingProvider = new MealProvider('test', 'http://originalpage.com', {'address':'10 Downing St., London'}, undefined, [], undefined, '555555', 0);
        let updatedProvider = new MealProvider('test', 'http://somepage.com', {'phone':'+155555555'}, undefined, [], undefined, '666666', 1);
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
        expect(cachedValueObj[0].color).toEqual('666666');
        expect(cachedValueObj[0].position).toEqual(1);
    })));

    it(' removes existing meal provider', async(inject([MealProviderService], (testService: MealProviderService) => {
        let existingProvider1 = new MealProvider('existing1', 'http://existingpage1.com', {'address':'10 Downing St., London'}, undefined, [], undefined, '555555', 0);
        let existingProvider2 = new MealProvider('existing2', 'http://existingpage2.com', {'phone':'+155555555'}, undefined, [], undefined, '666666', 1);
        let providerToDelete = new MealProvider('existing2', 'http://somepage.com', {'email':'existing2@somepage.com'}, undefined, [], undefined, '777777', 2);
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
        expect(cachedValueObj[0].color).toEqual('555555');
        expect(cachedValueObj[0].position).toEqual(0);
    })));

    it(' removes non-existing meal provider', async(inject([MealProviderService], (testService: MealProviderService) => {
        let existingProvider1 = new MealProvider('existing1', 'http://existingpage1.com', {'address':'10 Downing St., London'}, undefined, [], undefined, '555555', 0);
        let existingProvider2 = new MealProvider('existing2', 'http://existingpage2.com', {'phone':'+155555555'}, undefined, [], undefined, '666666', 1);
        let providerToDelete = new MealProvider('nonexisting', 'http://somepage.com', {'email':'existing2@somepage.com'}, undefined, [], undefined, '777777', 2);
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
        expect(cachedValueObj[0].color).toEqual('555555');
        expect(cachedValueObj[0].position).toEqual(0);
        expect(cachedValueObj[1].name).toEqual('existing2');
        expect(cachedValueObj[1].homePage).toEqual('http://existingpage2.com');
        expect(cachedValueObj[1].contacts).toEqual({'phone':'+155555555'});
        expect(cachedValueObj[1].color).toEqual('666666');
        expect(cachedValueObj[1].position).toEqual(1);
    })));

    it(' caches meal providers', async(inject([MealProviderService], (testService: MealProviderService) => {
        let provider1 = new MealProvider('existing1', 'http://existingpage1.com', {'address':'10 Downing St., London'}, undefined, [], undefined, '555555', 0);
        let provider2 = new MealProvider('existing2', 'http://existingpage2.com', {'phone':'+155555555'}, undefined, [], undefined, '666666', 1);
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
        expect(cachedValueObj[0].color).toEqual('555555');
        expect(cachedValueObj[0].position).toEqual(0);
        expect(cachedValueObj[1].name).toEqual('existing2');
        expect(cachedValueObj[1].homePage).toEqual('http://existingpage2.com');
        expect(cachedValueObj[1].contacts).toEqual({'phone':'+155555555'});
        expect(cachedValueObj[1].color).toEqual('666666');
        expect(cachedValueObj[1].position).toEqual(1);
    })));

    it(' returns cached meal providers', async(inject([MealProviderService], (testService: MealProviderService) => {
        let provider1 = new MealProvider('existing3', 'http://existingpage3.com', {'phone':'+255555555'}, undefined, [], undefined, undefined, 0);
        let provider2 = new MealProvider('existing2', 'http://existingpage2.com', {'phone':'+155555555'}, undefined, [], undefined, undefined, 1);
        let provider3 = new MealProvider('existing1', 'http://existingpage1.com', {'address':'10 Downing St., London'}, undefined, [], undefined, undefined, 2);
        let cachedKey;
        spyOn(localStorage, 'getItem').and.callFake((key) => {
          cachedKey = key;
          return JSON.stringify([provider1, provider2, provider3]);
        });
        let mealProviders = testService.getCachedMealProviders();
        expect(cachedKey).toEqual('mealProviders');

        expect(mealProviders instanceof Array).toBe(true);
        expect(mealProviders.length).toEqual(3);
        expect(mealProviders[0].name).toEqual('existing3');
        expect(mealProviders[0].homePage).toEqual('http://existingpage3.com');
        expect(mealProviders[0].contacts).toEqual({'phone':'+255555555'});
        expect(mealProviders[0].position).toEqual(0);
        expect(mealProviders[1].name).toEqual('existing2');
        expect(mealProviders[1].homePage).toEqual('http://existingpage2.com');
        expect(mealProviders[1].contacts).toEqual({'phone':'+155555555'});
        expect(mealProviders[1].position).toEqual(1);
        expect(mealProviders[2].name).toEqual('existing1');
        expect(mealProviders[2].homePage).toEqual('http://existingpage1.com');
        expect(mealProviders[2].contacts).toEqual({'address':'10 Downing St., London'});
        expect(mealProviders[2].position).toEqual(2);
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
        let getCachedHomeSpy = spyOn(mapService, 'getCachedHome').and.callFake(generateFakeHome);
        let calculateDistanceSpy = spyOn(mapService, 'calculateDistance').and.callFake(generateFakeDistance);
        let mealProviderObservables = testService.getDailyMealsByMealProviders();
        expect(cachedMealProvidersSpy).toHaveBeenCalled();
        expect(loadAndResolveXPathsSpy.calls.count()).toEqual(2);
        expect(loadAndResolveXPathsSpy.calls.argsFor(0)).toEqual(['http://existingpage1.com/daily-meal',
          '//a[1]', '//a[2]', '//a[3]', '//a[4]', '//a[5]', '//a[6]',
          '//b[1]', '//b[2]', '//b[3]', '//b[4]', '//b[5]']);
        expect(loadAndResolveXPathsSpy.calls.argsFor(1)).toEqual(['http://existingpage2.com/menu',
          '//a[1]', '//a[2]', '//a[3]', '//a[4]', '//a[5]']);
        mealProviderObservables.subscribe(data => {
          expect(calculateDistanceSpy.calls.count()).toEqual(2);
          expect(calculateDistanceSpy.calls.argsFor(0)[0].lat).toEqual(19);
          expect(calculateDistanceSpy.calls.argsFor(0)[1].lat).toEqual(15);
          expect(calculateDistanceSpy.calls.argsFor(1)[0].lat).toEqual(20);
          expect(calculateDistanceSpy.calls.argsFor(1)[1].lat).toEqual(15);

          expect(data.length).toEqual(2);

          expect(data[0]).toBeTruthy();
          expect(data[0].hasErrors()).toBe(false);
          expect(data[0].name).toEqual(existingProvider1.name);
          expect(data[0].distance).toEqual(4);
          expect(data[0].mealSets.length).toEqual(2);
          expect(data[0].mealSets[0].name).toEqual('menu1');
          expect(data[0].mealSets[0].price).toBeTruthy();
          expect(data[0].mealSets[0].price.value).toEqual(1500);
          expect(data[0].mealSets[0].price.currency).toEqual('Ft');
          expect(data[0].mealSets[0].meals.length).toEqual(4);
          expect(data[0].mealSets[0].meals[0].name).toEqual('antipasto');
          expect(data[0].mealSets[0].meals[1].name).toEqual('primo piatto');
          expect(data[0].mealSets[0].meals[2].name).toEqual('secondo piatto');
          expect(data[0].mealSets[0].meals[3].name).toEqual('panna cotta');
          expect(data[0].mealSets[1].name).toEqual('menu2');
          expect(data[0].mealSets[1].price).toBeTruthy();
          expect(data[0].mealSets[1].price.value).toEqual(2000);
          expect(data[0].mealSets[1].price.currency).toEqual('HUF');
          expect(data[0].mealSets[1].meals.length).toEqual(3);
          expect(data[0].mealSets[1].meals[0].name).toEqual('soup');
          expect(data[0].mealSets[1].meals[1].name).toEqual('fish');
          expect(data[0].mealSets[1].meals[2].name).toEqual('dessert');

          expect(data[1]).toBeTruthy();
          expect(data[1].hasErrors()).toBe(false);
          expect(data[1].name).toEqual(existingProvider2.name);
          expect(data[1].distance).toEqual(5);
          expect(data[1].mealSets.length).toEqual(1);
          expect(data[1].mealSets[0].name).toEqual('menu3');
          expect(data[1].mealSets[0].price).toBeTruthy();
          expect(data[1].mealSets[0].price.value).toEqual(4);
          expect(data[1].mealSets[0].price.currency).toEqual('EUR');
          expect(data[1].mealSets[0].meals.length).toEqual(3);
          expect(data[1].mealSets[0].meals[0].name).toEqual('Suppe');
          expect(data[1].mealSets[0].meals[1].name).toEqual('Wiener Schnitzel');
          expect(data[1].mealSets[0].meals[2].name).toEqual('Schokopuding');
        });
    })));

    it(' returns daily meals grouped by meal providers with meal sets if XPath resolution fails for one provider',
      async(inject([MealProviderService, XpathService, MapService], (testService: MealProviderService, xpathService: XpathService, mapService: MapService) => {
        let existingProvider1 = createMealProvider1();
        let existingProvider2 = createMealProvider2();
        let cachedMealProvidersSpy = spyOn(testService, 'getCachedMealProviders').and.callFake(() => {
          return [existingProvider1, existingProvider2];
        });
        let loadAndResolveXPathsSpy = spyOn(xpathService, 'loadAndResolveXPaths').and.callFake(generateFakeErrorXpathResult);
        let getCachedHomeSpy = spyOn(mapService, 'getCachedHome').and.callFake(generateFakeHome);
        let calculateDistanceSpy = spyOn(mapService, 'calculateDistance').and.callFake(generateFakeDistance);
        let mealProviderObservables = testService.getDailyMealsByMealProviders();
        expect(cachedMealProvidersSpy).toHaveBeenCalled();
        expect(loadAndResolveXPathsSpy.calls.count()).toEqual(2);
        expect(loadAndResolveXPathsSpy.calls.argsFor(0)).toEqual(['http://existingpage1.com/daily-meal',
          '//a[1]', '//a[2]', '//a[3]', '//a[4]', '//a[5]', '//a[6]',
          '//b[1]', '//b[2]', '//b[3]', '//b[4]', '//b[5]']);
        expect(loadAndResolveXPathsSpy.calls.argsFor(1)).toEqual(['http://existingpage2.com/menu',
          '//a[1]', '//a[2]', '//a[3]', '//a[4]', '//a[5]']);
        mealProviderObservables.subscribe(data => {
          expect(calculateDistanceSpy.calls.count()).toEqual(2);
          expect(calculateDistanceSpy.calls.argsFor(0)[0].lat).toEqual(19);
          expect(calculateDistanceSpy.calls.argsFor(0)[1].lat).toEqual(15);
          expect(calculateDistanceSpy.calls.argsFor(1)[0].lat).toEqual(20);
          expect(calculateDistanceSpy.calls.argsFor(1)[1].lat).toEqual(15);

          expect(data.length).toEqual(2);

          expect(data[0]).toBeTruthy();
          expect(data[0].hasErrors()).toBe(true);
          expect(data[0].name).toEqual(existingProvider1.name);
          expect(data[0].distance).toEqual(4);
          expect(data[0].mealSets.length).toEqual(0);

          expect(data[1]).toBeTruthy();
          expect(data[1].hasErrors()).toBe(false);
          expect(data[1].name).toEqual(existingProvider2.name);
          expect(data[1].distance).toEqual(5);
          expect(data[1].mealSets.length).toEqual(1);
          expect(data[1].mealSets[0].name).toEqual('menu3');
          expect(data[1].mealSets[0].price).toBeTruthy();
          expect(data[1].mealSets[0].price.value).toEqual(4);
          expect(data[1].mealSets[0].price.currency).toEqual('EUR');
          expect(data[1].mealSets[0].meals.length).toEqual(3);
          expect(data[1].mealSets[0].meals[0].name).toEqual('Suppe');
          expect(data[1].mealSets[0].meals[1].name).toEqual('Wiener Schnitzel');
          expect(data[1].mealSets[0].meals[2].name).toEqual('Schokopuding');
        });

    })));

    it(' returns daily meals grouped by meal providers with meal sets if no data were found for one provider',
      async(inject([MealProviderService, XpathService, MapService], (testService: MealProviderService, xpathService: XpathService, mapService: MapService) => {
        let existingProvider1 = createMealProvider1();
        let existingProvider2 = createMealProvider2();
        let cachedMealProvidersSpy = spyOn(testService, 'getCachedMealProviders').and.callFake(() => {
          return [existingProvider1, existingProvider2];
        });
        let loadAndResolveXPathsSpy = spyOn(xpathService, 'loadAndResolveXPaths').and.callFake(generateFakeEmptyXpathResult);
        let getCachedHomeSpy = spyOn(mapService, 'getCachedHome').and.callFake(generateFakeHome);
        let calculateDistanceSpy = spyOn(mapService, 'calculateDistance').and.callFake(generateFakeDistance);
        let mealProviderObservables = testService.getDailyMealsByMealProviders();
        expect(cachedMealProvidersSpy).toHaveBeenCalled();
        expect(loadAndResolveXPathsSpy.calls.count()).toEqual(2);
        expect(loadAndResolveXPathsSpy.calls.argsFor(0)).toEqual(['http://existingpage1.com/daily-meal',
          '//a[1]', '//a[2]', '//a[3]', '//a[4]', '//a[5]', '//a[6]',
          '//b[1]', '//b[2]', '//b[3]', '//b[4]', '//b[5]']);
        expect(loadAndResolveXPathsSpy.calls.argsFor(1)).toEqual(['http://existingpage2.com/menu',
          '//a[1]', '//a[2]', '//a[3]', '//a[4]', '//a[5]']);
        mealProviderObservables.subscribe(data => {
          expect(calculateDistanceSpy.calls.count()).toEqual(2);
          expect(calculateDistanceSpy.calls.argsFor(0)[0].lat).toEqual(19);
          expect(calculateDistanceSpy.calls.argsFor(0)[1].lat).toEqual(15);
          expect(calculateDistanceSpy.calls.argsFor(1)[0].lat).toEqual(20);
          expect(calculateDistanceSpy.calls.argsFor(1)[1].lat).toEqual(15);

          expect(data.length).toEqual(2);

          expect(data[0]).toBeTruthy();
          expect(data[0].isEmpty()).toBe(true);
          expect(data[0].name).toEqual(existingProvider1.name);
          expect(data[0].distance).toEqual(4);
          expect(data[0].mealSets.length).toEqual(0);

          expect(data[1]).toBeTruthy();
          expect(data[1].hasErrors()).toBe(false);
          expect(data[1].name).toEqual(existingProvider2.name);
          expect(data[1].distance).toEqual(5);
          expect(data[1].mealSets.length).toEqual(1);
          expect(data[1].mealSets[0].name).toEqual('menu3');
          expect(data[1].mealSets[0].price).toBeTruthy();
          expect(data[1].mealSets[0].price.value).toEqual(4);
          expect(data[1].mealSets[0].price.currency).toEqual('EUR');
          expect(data[1].mealSets[0].meals.length).toEqual(3);
          expect(data[1].mealSets[0].meals[0].name).toEqual('Suppe');
          expect(data[1].mealSets[0].meals[1].name).toEqual('Wiener Schnitzel');
          expect(data[1].mealSets[0].meals[2].name).toEqual('Schokopuding');
        });

    })));

    it(' returns daily meals grouped by meal sets if they can be loaded',
      async(inject([MealProviderService, XpathService, MapService], (testService: MealProviderService, xpathService: XpathService, mapService: MapService) => {
        let existingProvider1 = createMealProvider1();
        let existingProvider2 = createMealProvider2();
        let cachedMealProvidersSpy = spyOn(testService, 'getCachedMealProviders').and.callFake(() => {
          return [existingProvider1, existingProvider2];
        });
        let loadAndResolveXPathsSpy = spyOn(xpathService, 'loadAndResolveXPaths').and.callFake(generateFakeXpathResult);
        let getCachedHomeSpy = spyOn(mapService, 'getCachedHome').and.callFake(generateFakeHome);
        let calculateDistanceSpy = spyOn(mapService, 'calculateDistance').and.callFake(generateFakeDistance);
        let mealSetObservables = testService.getDailyMealsByMealSets();
        expect(cachedMealProvidersSpy).toHaveBeenCalled();
        expect(loadAndResolveXPathsSpy.calls.count()).toEqual(2);
        expect(loadAndResolveXPathsSpy.calls.argsFor(0)).toEqual(['http://existingpage1.com/daily-meal',
          '//a[1]', '//a[2]', '//a[3]', '//a[4]', '//a[5]', '//a[6]',
          '//b[1]', '//b[2]', '//b[3]', '//b[4]', '//b[5]']);
        expect(loadAndResolveXPathsSpy.calls.argsFor(1)).toEqual(['http://existingpage2.com/menu',
          '//a[1]', '//a[2]', '//a[3]', '//a[4]', '//a[5]']);
        mealSetObservables.subscribe(data => {
          expect(calculateDistanceSpy.calls.count()).toEqual(2);
          expect(calculateDistanceSpy.calls.argsFor(0)[0].lat).toEqual(19);
          expect(calculateDistanceSpy.calls.argsFor(0)[1].lat).toEqual(15);
          expect(calculateDistanceSpy.calls.argsFor(1)[0].lat).toEqual(20);
          expect(calculateDistanceSpy.calls.argsFor(1)[1].lat).toEqual(15);

          expect(data.length).toEqual(3);

          expect(data[0]).toBeTruthy();
          expect(data[0].mealProvider).toBeTruthy();
          expect(data[0].mealProvider.name).toEqual(existingProvider1.name);
          expect(data[0].mealProvider.hasErrors()).toBe(false);
          expect(data[0].name).toEqual('menu1');
          expect(data[0].price).toBeTruthy();
          expect(data[0].price.value).toEqual(1500);
          expect(data[0].price.currency).toEqual('Ft');
          expect(data[0].meals.length).toEqual(4);
          expect(data[0].meals[0].name).toEqual('antipasto');
          expect(data[0].meals[1].name).toEqual('primo piatto');
          expect(data[0].meals[2].name).toEqual('secondo piatto');
          expect(data[0].meals[3].name).toEqual('panna cotta');

          expect(data[1]).toBeTruthy();
          expect(data[1].name).toEqual('menu2');
          expect(data[1].mealProvider).toBeTruthy();
          expect(data[1].mealProvider.name).toEqual(existingProvider1.name);
          expect(data[1].mealProvider.hasErrors()).toBe(false);
          expect(data[1].price).toBeTruthy();
          expect(data[1].price.value).toEqual(2000);
          expect(data[1].price.currency).toEqual('HUF');
          expect(data[1].meals.length).toEqual(3);
          expect(data[1].meals[0].name).toEqual('soup');
          expect(data[1].meals[1].name).toEqual('fish');
          expect(data[1].meals[2].name).toEqual('dessert');

          expect(data[2]).toBeTruthy();
          expect(data[2].mealProvider).toBeTruthy();
          expect(data[2].mealProvider.hasErrors()).toBe(false);
          expect(data[2].mealProvider.name).toEqual(existingProvider2.name);
          expect(data[2].mealProvider.distance).toEqual(5);
          expect(data[2].name).toEqual('menu3');
          expect(data[2].price).toBeTruthy();
          expect(data[2].price.value).toEqual(4);
          expect(data[2].price.currency).toEqual('EUR');
          expect(data[2].meals.length).toEqual(3);
          expect(data[2].meals[0].name).toEqual('Suppe');
          expect(data[2].meals[1].name).toEqual('Wiener Schnitzel');
          expect(data[2].meals[2].name).toEqual('Schokopuding');
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

function generateFakeXpathResult(url, ...xpaths):Observable<XpathResolutionResult> {
    let xpathResult:{[key:string]:string} = {};
    if (url.indexOf('page1') >= 0) {
      xpathResult['//a[1]'] = 'menu1';
      xpathResult['//a[2]'] = '1500 Ft';
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
      xpathResult['//a[2]'] = '4 EUR';
      xpathResult['//a[3]'] = 'Suppe';
      xpathResult['//a[4]'] = 'Wiener Schnitzel';
      xpathResult['//a[5]'] = 'Schokopuding';
    }
    return Observable.of({
      url: url,
      xpathResult: xpathResult
    });
}

function generateFakeErrorXpathResult(url, ...xpaths):Observable<XpathResolutionResult> {
  if (url.indexOf('page1') >= 0) {
    return Observable.throw(new Error('Cannot resolve XPaths'));
  } else if (url.indexOf('page2') >= 0) {
    return generateFakeXpathResult(url, xpaths);
  }
}

function generateFakeEmptyXpathResult(url, ...xpaths):Observable<XpathResolutionResult> {
  if (url.indexOf('page1') >= 0) {
    let xpathResult: {[key: string]: string} = {};
    for (let xpath of xpaths) {
      xpathResult[xpath] = undefined;
    }
    return Observable.of({
      url: url,
      xpathResult: xpathResult
    });
  } else if (url.indexOf('page2') >= 0) {
    return generateFakeXpathResult(url, xpaths);
  }
}

function generateFakeHome(): Marker {
  return new Marker('home', 'address', new Location(15,15), '555555');
}

function generateFakeDistance(providerLocation: LocationJSON, homeLocation: LocationJSON): number {
    return providerLocation.lat - homeLocation.lat;
}
