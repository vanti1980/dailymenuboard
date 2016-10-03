import { CommonModule as Ng2CommonModule }       from '@angular/common';
import { ChangeDetectorRef, Directive, ElementRef, forwardRef, Input, Renderer, SimpleChange } from '@angular/core';
import {
    inject,
    TestBed,
    async,
    fakeAsync,
    tick,
    ComponentFixture,
} from '@angular/core/testing';

import {dispatchEvent} from '@angular/platform-browser/testing/browser_util';

import { ReactiveFormsModule, AbstractControl, ControlValueAccessor, FormArray, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Observable } from 'rxjs/Rx';

import { Location, MapService } from '../../../common/map';
import { StepMealSetComponent} from './index';
import { MealProvider, MealProviderService } from '../../../common/meal-provider';
import { MealSetXPath } from '../../../common/meal-set';
import { DebounceInputControlValueAccessor, LoadStatus } from '../../../common/util';

import { CommonModule } from '../../../common/common.module';

import { CoreModule } from '../../../core/core.module';

import { XpathService } from '../../../core/xpath';

import { Wizard } from '../wizard';
import { AddModule } from '../add.module';

class MockMealProviderService {
    getCachedMealProviders(): MealProvider[] {
        return [createMealProvider1()];
    }
}

class MockXpathService {
    mockDailyMealContents: string;
    mockXPathResult: { [key: string]: string };
    mockError: Error;

    getXDomainContent(url: string): Observable<string> {
        if (this.mockError) {
            return Observable.throw(this.mockError);
        }
        return Observable.of(this.mockDailyMealContents);
    }

    resolveXPaths(data: string, ...xpaths: string[]): { [key: string]: string } {
        return this.mockXPathResult;
    }
}

const mockXpathService = new MockXpathService();

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
            declarations: [
            ],
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
                    { provide: MapService, useValue: mockMapService },
                    { provide: XpathService, useValue: mockXpathService },
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

            // must be triggered here manually as change is triggered in AddComponent
            const changes: { [key: string]: SimpleChange } = {};
            changes['provider'] = new SimpleChange(createMealProvider1(), testComponent.provider);
            testComponent.ngOnChanges(changes);
            const controlArray = <FormArray>testComponent.group.controls["meals"];
            expect(controlArray.length).toEqual(3);
        });
    }));

    it(' should add a new meal control if + icon is clicked', async(() => {
        let fixture: ComponentFixture<StepMealSetComponent>, testComponent: StepMealSetComponent;
        TestBed.compileComponents().then(() => {
            fixture = prepareFixture();
            const testComponent = fixture.componentInstance;
            const element = fixture.nativeElement;
            const onAddMealSpy = spyOn(testComponent, "onAddMeal").and.callThrough();

            expect(element.querySelectorAll('div[formGroupName="meals"] input').length).toBe(4);
            element.querySelector('i[class="fa fa-plus"]').click();

            fixture.detectChanges();
            expect(onAddMealSpy).toHaveBeenCalled();
            const controlArray = <FormArray>testComponent.group.controls["meals"];
            expect(controlArray.length).toEqual(5);
            expect(element.querySelectorAll('div[formGroupName="meals"] input').length).toBe(5);
        });
    }));

    it(' should remove meal control if - icon for the 3rd meal is clicked', async(() => {
        let fixture: ComponentFixture<StepMealSetComponent>, testComponent: StepMealSetComponent;
        TestBed.compileComponents().then(() => {
            fixture = prepareFixture();
            const testComponent = fixture.componentInstance;
            const element = fixture.nativeElement;

            expect(element.querySelectorAll('div[formGroupName="meals"] input').length).toBe(4);

            // note that calling the method directly on component and detectChanges() did not change the DOM at all
            // therefore it must be triggered through emulated click
            element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(3) i[class="fa fa-minus"]').click();

            fixture.detectChanges();
            const controlArray = <FormArray>testComponent.group.controls["meals"];
            expect(controlArray.length).toEqual(3);
            expect(element.querySelectorAll('div[formGroupName="meals"] input').length).toBe(3);
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(3) input').value).toEqual('//a[6]');
        });
    }));

    it(' should fill the XPath inputs and the assist values if the component is loaded', async(() => {
        let fixture: ComponentFixture<StepMealSetComponent>, testComponent: StepMealSetComponent;
        TestBed.compileComponents().then(() => {
            mockXpathService.mockDailyMealContents = '<content></content>';
            mockXpathService.mockXPathResult = {
                '//a[1]': 'menu1',
                '//a[2]': '1500 Ft',
                '//a[3]': 'antipasto',
                '//a[4]': 'primo piatto',
                '//a[5]': 'secondo piatto',
                '//a[6]': 'panna cotta'
            };
            fixture = prepareFixture();
            const testComponent = fixture.componentInstance;
            const element = fixture.nativeElement;
            testComponent.onEnterStep();
            fixture.detectChanges();
            expect(element.querySelector('input[id="0_mealSetXpath"]').value).toEqual('//a[1]');
            expect(element.querySelector('div[id="0_mealSetXpathAssist"]').textContent).toEqual('menu1');
            expect(element.querySelector('input[id="0_mealSetPriceXpath"]').value).toEqual('//a[2]');
            expect(element.querySelector('div[id="0_mealSetPriceXpathAssist"]').textContent).toEqual('1500 Ft');
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(1) input').value).toEqual('//a[3]');
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(1) div.help-block').textContent).toEqual('antipasto');
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(2) input').value).toEqual('//a[4]');
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(2) div.help-block').textContent).toEqual('primo piatto');
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(3) input').value).toEqual('//a[5]');
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(3) div.help-block').textContent).toEqual('secondo piatto');
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(4) input').value).toEqual('//a[6]');
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(4) div.help-block').textContent).toEqual('panna cotta');
        });
    }));

    it(' should display the current value of XPath if a valid value is entered', fakeAsync(() => {
        let fixture: ComponentFixture<StepMealSetComponent>, testComponent: StepMealSetComponent;
        TestBed.compileComponents().then(() => {
            mockXpathService.mockDailyMealContents = '<content></content>';
            mockXpathService.mockXPathResult = {
                '//a[1]': 'menu1',
                '//a[2]': '1500 Ft',
                '//a[3]': 'antipasto',
                '//a[4]': 'primo piatto',
                '//a[5]': 'secondo piatto',
                '//a[6]': 'panna cotta',
                '//a[7]': 'spaghetti bolognese',
            };
            fixture = prepareFixture();
            const testComponent = fixture.componentInstance;
            const element = fixture.nativeElement;
            testComponent.onEnterStep();
            fixture.detectChanges();
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(2) input').value).toEqual('//a[4]');
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(2) div.help-block').textContent).toEqual('primo piatto');

            const inputElement = element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(2) input');
            inputElement.value = '//a[7]';

            // trigger debounce directive
            dispatchEvent(inputElement, 'keyup');
            fixture.detectChanges();

            // wait for debounce time
            tick(2000);
            tick();

            // wait for changes in model to be applied on view
            fixture.detectChanges();

            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(2) input').value).toEqual('//a[7]');
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(2) div.help-block').textContent).toEqual('spaghetti bolognese');
        });
    }));

    it(' should clear current value of XPath if an invalid value is entered', fakeAsync(() => {
        let fixture: ComponentFixture<StepMealSetComponent>, testComponent: StepMealSetComponent;
        TestBed.compileComponents().then(() => {
            mockXpathService.mockDailyMealContents = '<content></content>';
            mockXpathService.mockXPathResult = {
                '//a[1]': 'menu1',
                '//a[2]': '1500 Ft',
                '//a[3]': 'antipasto',
                '//a[4]': 'primo piatto',
                '//a[5]': 'secondo piatto',
                '//a[6]': 'panna cotta',
                '//a[7]': 'spaghetti bolognese',
            };
            fixture = prepareFixture();
            const testComponent = fixture.componentInstance;
            const element = fixture.nativeElement;
            testComponent.onEnterStep();
            fixture.detectChanges();
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(2) input').value).toEqual('//a[4]');
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(2) div.help-block').textContent).toEqual('primo piatto');

            const inputElement = element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(2) input');
            inputElement.value = '//i';

            // trigger debounce directive
            dispatchEvent(inputElement, 'keyup');
            fixture.detectChanges();

            // wait for debounce time
            tick(2000);
            tick();

            // wait for changes in model to be applied on view
            fixture.detectChanges();

            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(2) input').value).toEqual('//i');
            expect(element.querySelector('div[formGroupName="meals"] div.form-group:nth-child(2) div.help-block').textContent).toEqual('');
        });
    }));

    function prepareFixture(): ComponentFixture<StepMealSetComponent> {
        const fixture = TestBed.createComponent(StepMealSetComponent);
        const testComponent = fixture.componentInstance;
        const mealProvider = createMealProvider1();
        const element = fixture.nativeElement;
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
        { 'phone': '+155555555' },
        'http://existingpage2.com/menu',
        [
            new MealSetXPath('//a[1]', '//a[2]', ['//a[3]', '//a[4]', '//a[5]'])
        ],
        new Location(20, 40),
        '00cccc',
        1
    );
}
