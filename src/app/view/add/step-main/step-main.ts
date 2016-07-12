import {NgForm, ControlArray, ControlGroup, Control, FormBuilder, Validators, NgClass} from '@angular/common';
import {Component, Input, OnChanges, SimpleChange, ViewChild, ChangeDetectionStrategy} from '@angular/core';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/debounceTime';

import {DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {ModalComponent, MODAL_DIRECTIVES } from 'ng2-bs3-modal/ng2-bs3-modal';

import {Wizard} from '../wizard';
import {EmitterService, Events} from '../../../common/event';
import {MapService} from '../../../common/map';
import {MealProvider, MealProviderService} from '../../../common/meal-provider';
import {MealSetXPath} from '../../../common/meal-set';
import {DebounceInputControlValueAccessor, Holder} from '../../../common/util';
import {XpathTokens, XpathService} from '../../../common/xpath';

@Component({
    selector: 'dmb-add-step-main',
    providers: [MealProviderService, MapService],
    directives: [NgClass, MODAL_DIRECTIVES, DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES, DebounceInputControlValueAccessor],
    template: require('./step-main.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepMainComponent implements OnChanges {

    @Input() provider: MealProvider;
    @Input() wizard: Wizard;

    group: ControlGroup;
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

      // Mark as pending to prevent devmode check fail that isValid() changed while rendering - caused by async validator
      this.group.markAsPending();
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
      if (this.providerHolder && changes['provider']) {
        this.providerHolder.data = changes['provider'].currentValue;
      }
    }

    buildForm(): ControlGroup {
        return this.builder.group({
            name: [this.providerHolder.data.name, Validators.compose([Validators.required, duplicatedNameValidatorFactory(this.mealProviderService, this.providerHolder)])],
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


function colorValidator(control: Control) {
    if (control.value && !control.value.match(/([0-9]|[a-f]|[A-F]){6}/)) {
        return { 'color': true };
    }
    return null;
}

function duplicatedNameValidatorFactory(mealProviderService: MealProviderService, providerHolder: Holder<MealProvider>) {
    return (control: Control) => {
      if (providerHolder.data.isNew) {
        for (let mealProvider of mealProviderService.getCachedMealProviders()) {
            if (mealProvider.name == control.value) {
                return { 'duplicated': true };
            }
        }
      }
    };
}

function duplicatedDailyMealUrlValidatorFactory(mealProviderService: MealProviderService, providerHolder: Holder<MealProvider>) {
    return (control: Control) => {
      let provider:MealProvider = providerHolder.data;
        for (let mealProvider of mealProviderService.getCachedMealProviders()) {
            if (mealProvider.dailyMealUrl == control.value && (provider.isNew || mealProvider.name !== provider.name)) {
                return { 'duplicated': true };
            }
        }
    };
}

function addressValidatorFactory(mapService: MapService, providerHolder: Holder<MealProvider>) {
    return (control: Control) => {
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
