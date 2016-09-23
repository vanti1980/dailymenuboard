import {
    inject,
    TestBed,
    async,
    fakeAsync,
    tick,
    ComponentFixture,
} from '@angular/core/testing';

import {SimpleChange} from '@angular/core';
import {ReactiveFormsModule, FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Rx';

import {Location, MapService } from '../../../common/map';
import {StepMainComponent} from './index';
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

describe('Test StepMainComponent', () => {

    beforeEach(() => TestBed
        .configureTestingModule({
            imports: [
                AddModule,
                CoreModule,
                CommonModule,
                ReactiveFormsModule
            ],
            providers: [
                StepMainComponent,
            ]
        })
        .overrideComponent(StepMainComponent, {
            set: {
                providers: [
                    { provide: MealProviderService, useClass: MockMealProviderService },
                    { provide: MapService, useValue: mockMapService }
                ],
            },
        })
    );

    describe('Test validators', () => {

        it(' should accept colors defined with 6 hexadecimal characters', async(() => {
            TestBed.compileComponents().then(() => {
                const controls = prepareControls({ color: '123abc' });
                expect(controls['color'].valid).toEqual(true);
            });
        }));

        it(' should reject colors defined with 6 non-hexadecimal characters', async(() => {
            TestBed.compileComponents().then(() => {
                const controls = prepareControls({ color: 'defghi' });
                expect(controls['color'].valid).toEqual(false);
                expect(controls['color'].errors['color']).toEqual(true);
            });
        }));

        it(' should reject colors defined with less than 6 hexadecimal characters', async(() => {
            TestBed.compileComponents().then(() => {
                const controls = prepareControls({ color: '123ab' });
                expect(controls['color'].valid).toEqual(false);
                expect(controls['color'].errors['color']).toEqual(true);
            });
        }));

        it(' should reject colors defined with more than 6 hexadecimal characters', async(() => {
            TestBed.compileComponents().then(() => {
                const controls = prepareControls({ color: '123abcd' });
                expect(controls['color'].valid).toEqual(false);
                expect(controls['color'].errors['color']).toEqual(true);
            });
        }));

        it(' should accept provider with non-existing name', async(() => {
            TestBed.compileComponents().then(() => {
                const controls = prepareControls({ name: 'nonexisting1' });
                expect(controls['name'].valid).toEqual(true);
            });
        }));

        it(' should reject provider with existing name if provider is being added', async(() => {
            TestBed.compileComponents().then(() => {
                const controls = prepareControls({ name: 'existing1' });
                expect(controls['name'].valid).toEqual(false);
                expect(controls['name'].errors['duplicated']).toEqual(true);
            });
        }));

        it(' should disable provider if provider is being edited', async(() => {
            TestBed.compileComponents().then(() => {
                const controls = prepareControls({ name: 'existing1' }, true);
                expect(controls['name'].disabled).toEqual(true);
            });
        }));

        it(' should accept provider with non-existing daily meal URL', async(() => {
            TestBed.compileComponents().then(() => {
                const controls = prepareControls({ dailyMealUrl: 'nonexisting1' });
                expect(controls['dailyMealUrl'].valid).toEqual(true);
            });
        }));

        it(' should reject provider with existing daily meal URL if provider is being added', async(() => {
            TestBed.compileComponents().then(() => {
                const controls = prepareControls({ dailyMealUrl: 'http://existingpage1.com/daily-meal' });
                expect(controls['dailyMealUrl'].valid).toEqual(false);
                expect(controls['dailyMealUrl'].errors['duplicated']).toEqual(true);
            });
        }));

        it(' should accept provider with existing daily meal URL and the same name if provider is being edited', async(() => {
            TestBed.compileComponents().then(() => {
                const controls = prepareControls({ name: 'existing1', dailyMealUrl: 'http://existingpage1.com/daily-meal' }, true);
                expect(controls['dailyMealUrl'].valid).toEqual(true);
            });
        }));

        it(' should reject provider with existing daily meal URL and a different provider name if provider is being edited', async(() => {
            TestBed.compileComponents().then(() => {
                const controls = prepareControls({ name: 'nonexisting1', dailyMealUrl: 'http://existingpage1.com/daily-meal' }, true);
                expect(controls['dailyMealUrl'].valid).toEqual(false);
                expect(controls['dailyMealUrl'].errors['duplicated']).toEqual(true);
            });
        }));

        it(' should accept provider with valid location resolved', async(() => {
            TestBed.compileComponents().then(() => {
                mockMapService.mockValue = new Location(19, 49);
                const fixture = TestBed.createComponent(StepMainComponent);
                const controls = prepareControls({ address: 'Times Square, New York' }, false, fixture);
                fixture.whenStable().then(() => {
                    fixture.detectChanges();
                    expect(controls['address'].valid).toEqual(true);
                });
            });
        }));

        it(' should reject provider with unknown location', async(() => {
            TestBed.compileComponents().then(() => {
                mockMapService.mockValue = void 0;
                const fixture = TestBed.createComponent(StepMainComponent);
                const controls = prepareControls({ address: 'invalid address' }, false, fixture);
                fixture.whenStable().then(() => {
                    fixture.detectChanges();
                    expect(controls['address'].valid).toEqual(false);
                    expect(controls['address'].errors['address']).toEqual(true);
                });
            });
        }));

        it(' should reject provider if location resolution resulted in an error', async(() => {
            TestBed.compileComponents().then(() => {
                mockMapService.mockError = new Error();
                const fixture = TestBed.createComponent(StepMainComponent);
                const controls = prepareControls({ address: 'invalid address throwing error' }, false, fixture);
                fixture.whenStable().then(() => {
                    fixture.detectChanges();
                    expect(controls['address'].valid).toEqual(false);
                    expect(controls['address'].errors['address']).toEqual(true);
                });
            });
        }));

        function prepareControls(values: { [key: string]: string }, existingProvider?: boolean, fixture?: ComponentFixture<StepMainComponent>): { [key: string]: FormControl } {
            fixture = fixture || TestBed.createComponent(StepMainComponent);
            const testComponent = fixture.componentInstance;
            const mealProvider = createMealProvider1();
            if (existingProvider) {
                mealProvider.setStatus(LoadStatus.LOADED);
            }
            testComponent.provider = mealProvider;
            testComponent.wizard = new Wizard(1);
            fixture.detectChanges();
            const resultControls: { [key: string]: FormControl } = {};
            for (let key in values) {
                if (values.hasOwnProperty(key)) {
                    let control = <FormControl>testComponent.group.controls[key];
                    control.setValue(values[key]);
                    resultControls[key] = control;
                }
            }
            fixture.detectChanges();
            return resultControls;
        }

    });

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
