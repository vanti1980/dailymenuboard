import {
  inject,
  TestBed,
  async,
  fakeAsync
} from '@angular/core/testing';

import {Injector, SimpleChange} from '@angular/core';

import {Observable} from 'rxjs/Rx';

import {Location,MapService} from '../map';
import {MealProvider,MealProviderComponent,MealProviderService} from './index';
import {MealSetXPath} from '../meal-set';

import {EmitterService, Events} from '../../core/event';
import {XpathResolutionResult, XpathService} from '../../core/xpath';

describe('Test MealProviderComponent', () => {

  beforeEach(() => TestBed.configureTestingModule({
      providers: [
        EmitterService,
        {
          provide: MapService,
          useValue: new MapService(void 0)
        },
        MealProviderService,
        MealProviderComponent,
        XpathService,
      ]})
    );

    it(' should emit event to open edit dialog', inject([MealProviderComponent, EmitterService], (testComponent: MealProviderComponent, emitterService: EmitterService) => {
      let mealProvider = void 0;
        emitterService.get(Events.MEAL_PROVIDER_EDITED).subscribe((msg)=>{
          mealProvider = msg;
        });
        testComponent.openEditDialog(createMealProvider1());
        expect(mealProvider).not.toBeNull();
        expect(mealProvider.name).toEqual('existing1');
    }));

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
});
