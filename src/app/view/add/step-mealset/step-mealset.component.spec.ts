import { CommonModule as Ng2CommonModule }       from '@angular/common';
import {
    inject,
    TestBed,
    async,
    fakeAsync,
    tick,
    ComponentFixture,
} from '@angular/core/testing';

import {ChangeDetectorRef, SimpleChange} from '@angular/core';
import {ReactiveFormsModule, AbstractControl, FormArray} from '@angular/forms';

import {Observable} from 'rxjs/Rx';

import {Location, MapService } from '../../../common/map';
import {StepMealSetComponent} from './index';
import {MealProvider, MealProviderService} from '../../../common/meal-provider';
import {MealSetXPath} from '../../../common/meal-set';
import {LoadStatus} from '../../../common/util';

import {CommonModule} from '../../../common/common.module';

import {CoreModule} from '../../../core/core.module';
import {Wizard} from '../wizard';
import {AddModule} from '../add.module';

class MockMealProviderService {
    getCachedMealProviders(): MealProvider[] {
        return [createMealProvider1()];
    }
}

class MockMapService {
    mockValue: Location;
    mockError: Error;

    getLocation(address: string): Observable<Location> {
      if (this.mockError) {
        return Observable.throw(this.mockError);
      }
      return Observable.of(this.mockValue);
    }
}

const mockMapService = new MockMapService();

describe('Test StepMealSetComponent', () => {

    beforeEach(() => TestBed
        .configureTestingModule({
            imports: [
                AddModule,
                CoreModule,
                CommonModule,
                Ng2CommonModule,
                ReactiveFormsModule
            ],
            providers: [
                ChangeDetectorRef,
                StepMealSetComponent,
            ]
        })
        .overrideComponent(StepMealSetComponent, {
            set: {
                providers: [
                    { provide: MealProviderService, useClass: MockMealProviderService },
                    { provide: MapService, useValue: mockMapService }
                ],
            },
        })
    );

    it(' should initialize the correct number of meal controls', async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = prepareFixture();
            const testComponent = fixture.componentInstance;
            const controlArray = <FormArray>testComponent.group.controls["meals"];
            expect(controlArray.length).toEqual(4);
        });
    }));

    it(' should re-initialize the meal controls if meal provider has changed', async(() => {
        let fixture, testComponent;
        TestBed.compileComponents().then(() => {
            fixture = prepareFixture();
            testComponent = fixture.componentInstance;
            testComponent.provider = createMealProvider2();
        })
        .then(() => {
          //TODO ensure that ngOnChanges() is called
          fixture.detectChanges();
          const controlArray = <FormArray>testComponent.group.controls["meals"];
          expect(controlArray.length).toEqual(3);
        });
    }));

    function prepareFixture(): ComponentFixture<StepMealSetComponent> {
        const fixture = TestBed.createComponent(StepMealSetComponent);
        const testComponent = fixture.componentInstance;
        const mealProvider = createMealProvider1();
        testComponent.provider = mealProvider;
        testComponent.wizard = new Wizard(1);
        testComponent.mealSetIndex = 0;
        fixture.detectChanges();
        return fixture;
    }


});

function createMealProvider1(): MealProvider {
    return new MealProvider(
        'existing1',
        'http://existingpage1.com',
        { 'address': '10 Downing St., London' },
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
