import {Component, Input, OnChanges, SimpleChange, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {FormArray, FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/debounceTime';

import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

import {Wizard} from '../wizard';
import {MapService} from '../../../common/map';
import {MealProvider, MealProviderService} from '../../../common/meal-provider';
import {MealSetXPath} from '../../../common/meal-set';
import {DebounceInputControlValueAccessor, Holder} from '../../../common/util';

import {EmitterService, Events} from '../../../core/event';
import {XpathTokens, XpathService} from '../../../core/xpath';

@Component({
    selector: 'dmb-add-step-main',
    providers: [MealProviderService, MapService],
    template: require('./step-main.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepMainComponent implements OnChanges {

    @Input() provider: MealProvider;
    @Input() wizard: Wizard;

    group: FormGroup;
    providerHolder: Holder<MealProvider>;

    constructor(
        private emitterService: EmitterService,
        private builder: FormBuilder,
        private mealProviderService: MealProviderService,
        private mapService: MapService,
        private xpathService: XpathService) {
    }

    ngOnInit() {
      this.providerHolder = { data: this.provider };
      this.group = this.buildForm();
    }

    init(provider: MealProvider, wizard: Wizard) {
      this.provider = provider;
      this.wizard = wizard;

      // Update validity state so that Next button is available
      // don't mix the order of markAsPending and updateValueAndValidity
      // otherwise ExpressionChangedAfterItHasBeenCheckedException is thrown
      // this.group.updateValueAndValidity();
      // Mark as pending to prevent devmode check fail that isValid() changed while rendering - caused by async validator
      this.group.markAsPending();
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
      if (this.providerHolder && changes['provider']) {
        this.providerHolder.data = changes['provider'].currentValue;
        this.group.markAsPending();
      }
    }

    buildForm(): FormGroup {
        return this.builder.group({
            name: new FormControl({value: this.providerHolder.data.name, disabled: !this.providerHolder.data.isUninitialized()}, Validators.compose([Validators.required, duplicatedNameValidatorFactory(this.mealProviderService, this.providerHolder)])),
            homePage: [this.providerHolder.data.homePage],
            phone: [this.providerHolder.data.contacts['phone']],
            address: [this.providerHolder.data.contacts['address'], Validators.required, addressValidatorFactory(this.mapService, this.providerHolder)],
            dailyMealUrl: [this.providerHolder.data.dailyMealUrl, Validators.compose([Validators.required, duplicatedDailyMealUrlValidatorFactory(this.mealProviderService, this.providerHolder)])],
            color: [this.providerHolder.data.color, Validators.compose([Validators.required, colorValidator])]
        });
    }

    onEnterStep() {
    }

    isValid():boolean {
      return this.group.valid;
    }

}


function colorValidator(control: FormControl) {
    if (control.value && !control.value.match(/([0-9]|[a-f]|[A-F]){6}/)) {
        return { 'color': true };
    }
    return null;
}

function duplicatedNameValidatorFactory(mealProviderService: MealProviderService, providerHolder: Holder<MealProvider>) {
    return (control: FormControl) => {
      if (providerHolder.data.isUninitialized()) {
        for (let mealProvider of mealProviderService.getCachedMealProviders()) {
            if (mealProvider.name == control.value) {
                return { 'duplicated': true };
            }
        }
      }
    };
}

function duplicatedDailyMealUrlValidatorFactory(mealProviderService: MealProviderService, providerHolder: Holder<MealProvider>) {
    return (control: FormControl) => {
      let provider:MealProvider = providerHolder.data;
        for (let mealProvider of mealProviderService.getCachedMealProviders()) {
            if (mealProvider.dailyMealUrl == control.value && (provider.isUninitialized() || mealProvider.name !== provider.name)) {
                return { 'duplicated': true };
            }
        }
    };
}

function addressValidatorFactory(mapService: MapService, providerHolder: Holder<MealProvider>) {
    return (control: FormControl) => {
        return new Promise((resolve, reject) => {
            mapService.getLocation(control.value)
                .subscribe(
                location => {
                    if (location) {
                        providerHolder.data.location = location;
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
