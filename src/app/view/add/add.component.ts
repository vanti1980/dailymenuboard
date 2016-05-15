import {NgForm, ControlArray, ControlGroup, Control, FormBuilder, Validators} from '@angular/common';
import {Component} from '@angular/core';

import {MealProvider, MealProviderService} from '../../common/meal-provider';

@Component({
    selector: 'add-view',
    providers: [MealProviderService],
    directives: [],
    template: require('./add.html')
})
export class AddComponent {

    group: ControlGroup;
    provider: MealProvider;

    constructor(private builder: FormBuilder, private mealProviderService: MealProviderService) {
        this.provider = new MealProvider(null, null, {}, null, {}, {}, {}, null, null);
        this.group = this.builder.group({
            name: ['', Validators.compose([Validators.required, duplicatedFactory(mealProviderService, this.provider)])],
            homePage: new Control(),
            phone: new Control(),
            address: new Control(),
            dailyMealUrl: new Control(),
            mealSets: new ControlArray([new Control()]),
            color: new Control()
        });
    }

    onNgInit() {
    }

    onSubmit() {
        console.log("*****submitted:");
    }
}

function duplicatedFactory(mealProviderService: MealProviderService, currentProvider: MealProvider) {
    return (control: Control) => {
        for (let mealProvider of mealProviderService.getCachedMealProviders()) {
            if (mealProvider.name == currentProvider.name) {
                return { 'duplicated': true };
            }
        }

    }
}
