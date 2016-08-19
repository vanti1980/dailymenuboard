import {provide, Injector} from '@angular/core';
import {describe, expect, it, xit, inject, async, fakeAsync, beforeEachProviders} from '@angular/core/testing';

import {Observable} from 'rxjs/Rx';

import {MealProvider} from './meal-provider.model.ts';
import {MealProviderService} from './meal-provider.service.ts';

import {XpathService} from '../xpath/xpath.service';

import {MapService} from '../map/map.service';

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

});
