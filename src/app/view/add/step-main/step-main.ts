import {NgForm, ControlArray, ControlGroup, Control, FormBuilder, Validators, NgClass} from '@angular/common';
import {Component, Input, ViewChild} from '@angular/core';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/debounceTime';

import {DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {ModalComponent, MODAL_DIRECTIVES } from 'ng2-bs3-modal/ng2-bs3-modal';

import {Wizard} from '../wizard';
import {EmitterService, Events} from '../../../common/event';
import {MapService} from '../../../common/map';
import {MealProvider, MealProviderService} from '../../../common/meal-provider';
import {MealSetXPath} from '../../../common/meal-set';
import {DebounceInputControlValueAccessor} from '../../../common/util';
import {XpathTokens, XpathService} from '../../../common/xpath';

@Component({
    selector: 'dmb-add-step-main',
    providers: [MealProviderService, MapService],
    directives: [NgClass, MODAL_DIRECTIVES, DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES, DebounceInputControlValueAccessor],
    template: require('./step-main.html')
})
export class StepMainComponent {
    @Input() provider: MealProvider;
    @Input() wizard: Wizard;

    group: ControlGroup;

    constructor(
        private emitterService: EmitterService,
        private builder: FormBuilder,
        private mealProviderService: MealProviderService,
        private mapService: MapService,
        private xpathService: XpathService) {
    }

    ngOnInit() {
      this.group = this.buildForm();
    }

    buildForm(): ControlGroup {
        return this.builder.group({
            name: ['', Validators.compose([Validators.required, duplicatedNameValidatorFactory(this.mealProviderService)])],
            homePage: new Control(),
            phone: new Control(),
            address: new Control('', Validators.required, addressValidatorFactory(this.mapService, this.provider)),
            dailyMealUrl: ['', Validators.compose([Validators.required, duplicatedDailyMealUrlValidatorFactory(this.mealProviderService)])],
            color: ['', Validators.compose([Validators.required, colorValidator])]
        });
    }

    onEnterStep() {
    }

    isValid():boolean {
      return this.group.valid;
    }

}


function colorValidator(control: Control) {
    if (control.value && !control.value.match(/([0-9]|[a-f]|[A-F]){6}/)) {
        return { 'color': true };
    }
    return null;
}

function duplicatedNameValidatorFactory(mealProviderService: MealProviderService) {
    return (control: Control) => {
        for (let mealProvider of mealProviderService.getCachedMealProviders()) {
            if (mealProvider.name == control.value) {
                return { 'duplicated': true };
            }
        }
    };
}

function duplicatedDailyMealUrlValidatorFactory(mealProviderService: MealProviderService) {
    return (control: Control) => {
        for (let mealProvider of mealProviderService.getCachedMealProviders()) {
            if (mealProvider.dailyMealUrl == control.value) {
                return { 'duplicated': true };
            }
        }
    };
}

function addressValidatorFactory(mapService: MapService, mealProvider: MealProvider) {
    return (control: Control) => {
        return new Promise((resolve, reject) => {
            mapService.getLocation(control.value)
                .subscribe(
                location => {
                    if (location) {
                        mealProvider.location = location;
                        console.log("Meal provider location:" + JSON.stringify(location));
                        resolve(null);
                    } else {
                        resolve({ address: true });
                    }
                },
                err => {
                    resolve({ address: true });
                }
                );
        });
    };
}
