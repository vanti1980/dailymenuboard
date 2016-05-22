import {NgForm, ControlArray, ControlGroup, Control, FormBuilder, Validators, NgClass} from '@angular/common';
import {Component} from '@angular/core';

import {MealProvider, MealProviderService} from '../../common/meal-provider';
import {MealSetXPath} from '../../common/meal-set';

@Component({
    selector: 'add-view',
    providers: [MealProviderService],
    directives: [NgClass],
    template: require('./add.html')
})
export class AddComponent {

    group: ControlGroup;
    provider: MealProvider;

    constructor(private builder: FormBuilder, private mealProviderService: MealProviderService) {
        this.provider = new MealProvider(null, null, {}, null, [new MealSetXPath(null, null, [])], null, null);
        this.group = this.builder.group({
            name: ['', Validators.compose([Validators.required, duplicatedValidatorFactory(mealProviderService, this.provider)])],
            homePage: new Control(),
            phone: new Control(),
            address: new Control(),
            dailyMealUrl: new Control(),
            mealSets: new ControlArray([this.createMealSetControlGroup()]),
            color: ['', Validators.compose([Validators.required, colorValidator])]
        });
    }

    private createMealSetControlGroup(): ControlGroup {
      return this.builder.group({
        mealSetXpath: new Control(),
        mealSetPriceXpath: new Control(),
        meals: new ControlArray([this.createMealControl()])
      });
    }

    private createMealControl(): Control {
      return new Control();
    }

    public log(obj:any) {
      for (var key in obj) {
        console.log(key + "=" + obj[key]);
      }
    }

    ngOnInit() {
    }

    onSubmit() {
      console.log(JSON.stringify(this.provider));
    }
}

function colorValidator(control: Control) {
  if (control.value && !control.value.match(/([0-9]|[a-f]|[A-F]){6}/)) {
    return { 'color': true };
  }
  return null;
}

function duplicatedValidatorFactory(mealProviderService: MealProviderService, currentProvider: MealProvider) {
    return (control: Control) => {
        for (let mealProvider of mealProviderService.getCachedMealProviders()) {
            if (mealProvider.name == currentProvider.name) {
                return { 'duplicated': true };
            }
        }

    }
}
