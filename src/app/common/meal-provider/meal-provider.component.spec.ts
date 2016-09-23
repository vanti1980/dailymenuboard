import {
    inject,
    TestBed,
    async,
    fakeAsync,
    tick
} from '@angular/core/testing';

import {SimpleChange} from '@angular/core';

import {Location} from '../map';
import {MealProvider, MealProviderComponent, MealProviderService} from './index';
import {MealSetXPath} from '../meal-set';

import {CommonModule} from '../../common/common.module';

import {CoreModule} from '../../core/core.module';
import {EmitterService, Events} from '../../core/event';

describe('Test MealProviderComponent', () => {

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            CoreModule,
            CommonModule,
        ],
        providers: [
            MealProviderComponent,
        ]
    }));

    it(' should emit event to open edit dialog', inject([MealProviderComponent, EmitterService], (testComponent: MealProviderComponent, emitterService: EmitterService) => {
        let mealProvider = void 0;
        emitterService.get(Events.MEAL_PROVIDER_EDITED).subscribe((msg) => {
            mealProvider = msg;
        });
        testComponent.openEditDialog(createMealProvider1());
        expect(mealProvider).not.toBeNull();
        expect(mealProvider.name).toEqual('existing1');
    }));

    it(' should open confirmation dialog if meal provider is about to be removed', fakeAsync(() => {
        TestBed.compileComponents().then(() => {

            const fixture = TestBed.createComponent(MealProviderComponent);
            const testComponent = fixture.componentInstance;
            const confirmDialogOpenSpy = spyOn(testComponent.confirmDialog, 'open');
            const mealProvider = createMealProvider1();
            testComponent.mealProvider = mealProvider;
            fixture.detectChanges();
            tick();
            testComponent.openRemoveDialog(mealProvider);
            expect(confirmDialogOpenSpy).toHaveBeenCalled();
            expect(confirmDialogOpenSpy.calls.first().args[0]).toEqual(mealProvider);
        });
    }));

    it(' should remove meal provider if removal is confirmed', inject([MealProviderComponent, MealProviderService, EmitterService], (testComponent: MealProviderComponent, mealProviderService: MealProviderService, emitterService: EmitterService) => {
        const mealProviderRemoveSpy = spyOn(mealProviderService, 'removeMealProvider');
        const mealProvider = createMealProvider1();
        let mealProviderInEvent = void 0;
        emitterService.get(Events.MEAL_PROVIDER_REMOVED).subscribe((msg) => {
            mealProviderInEvent = msg;
        });

        testComponent.confirmRemoveMealProvider(mealProvider);
        expect(mealProviderRemoveSpy).toHaveBeenCalled();
        expect(mealProviderRemoveSpy.calls.first().args[0]).toEqual(mealProvider);
        expect(mealProviderInEvent).toEqual(mealProvider);
    }));

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
});
