
import {describe, expect, it, xit, inject, beforeEachProviders} from '@angular/core/testing';
import {MealProviderDetailService} from './';
export function main() {
    describe('Test MealProviderDetailService', () => {

        beforeEachProviders(() => [
            MealProviderDetailService
        ]);

        it(' should be the resolveXPath method', inject([MealProviderDetailService], (testService: MealProviderDetailService) => {
            expect(testService.resolveXPath('a', 'b')).toBe('Injected Service');
        }));

    });
}
