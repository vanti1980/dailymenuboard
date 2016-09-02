import {NgForm, ControlArray, ControlGroup, Control, FormBuilder, Validators, NgClass} from '@angular/common';
import {Component, Input, OnChanges, SimpleChange, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/debounceTime';

import {DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {ModalComponent, MODAL_DIRECTIVES } from 'ng2-bs3-modal/ng2-bs3-modal';

import {Wizard} from '../wizard';
import {DebounceInputControlValueAccessor} from '../../../common/util';
import {EmitterService, Events} from '../../../common/event';
import {MapService} from '../../../common/map';
import {MealProvider, MealProviderService} from '../../../common/meal-provider';
import {MealSetXPath} from '../../../common/meal-set';
import {Holder} from '../../../common/util';
import {XpathTokens, XpathService} from '../../../common/xpath';
import {XpathFragmentComponent} from '../xpath-fragment/xpath-fragment';


@Component({
    selector: 'dmb-add-step-mealset',
    providers: [MealProviderService, MapService],
    directives: [NgClass, TOOLTIP_DIRECTIVES, XpathFragmentComponent, DebounceInputControlValueAccessor],
    template: require('./step-mealset.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepMealSetComponent implements OnChanges {
    @Input() provider: MealProvider;
    @Input() wizard: Wizard;
    @Input() mealSetIndex: number;
    dailyMealContents: string;

    group: ControlGroup;

    constructor(
        private emitterService: EmitterService,
        private builder: FormBuilder,
        private mealProviderService: MealProviderService,
        private mapService: MapService,
        private xpathService: XpathService,
        private changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnInit() {
      this.group = this.createMealSetControlGroup();
      this.initControls();
    }


    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
      if (changes['provider']) {
        this.initControls();
      }
    }

    initControls(): void {
      // to skip control adjustment when dummy provider is set
      if (this.group && this.provider.mealSetXPaths.length > 0) {
        let mealControls = (<ControlArray>this.group.find('meals'));
        while (mealControls.length < this.provider.mealSetXPaths[this.wizard.mealSetIndex].meals.length) {
          mealControls.push(this.createMealControl());
        }
        while (mealControls.length > this.provider.mealSetXPaths[this.wizard.mealSetIndex].meals.length) {
          mealControls.removeAt(mealControls.length - 1);
        }
      }
    }

    public createMealSetControlGroup(): ControlGroup {
        return this.builder.group({
            mealSetXpath: [''],
            mealSetPriceXpath: [''],
            meals: new ControlArray([this.createMealControl()])
        });
    }

    static createMealSetXPath(): MealSetXPath {
        return new MealSetXPath(null, null, []);
    }

    public onAddMeal() {
        this.provider.mealSetXPaths[this.wizard.mealSetIndex].meals.push('');
        (<ControlArray>this.group.find('meals')).push(this.createMealControl());
    }

    public onRemoveMeal(mealIndex: number) {
        if (this.provider.mealSetXPaths[this.wizard.mealSetIndex].meals.length > 1) {
            this.provider.mealSetXPaths[this.wizard.mealSetIndex].meals.splice(mealIndex, 1);
            (<ControlArray>this.group.find('meals')).removeAt(mealIndex);
        }
    }

    private createMealControl(): Control {
        return new Control('');
    }

    get xpathFragments(): string[] {
        return XpathTokens.values();
    }

    private resolveXpath(xpath: string) {
      if (this.dailyMealContents) {
          try {
              let xpathMap = this.xpathService.resolveXPaths(this.dailyMealContents, xpath);
              return xpathMap[xpath];
          }
          catch (err) {
              // XPath is invalid, do nothing
          }
      }
    }

    xpathAssist(property: string, mealIx?: number): string {
      let propValue:string|string[] = this.provider.mealSetXPaths[this.wizard.mealSetIndex][property];
      let value:string = undefined;
      if (mealIx !== undefined) {
        value = propValue[mealIx];
      }
      else {
        value = <string>propValue;
      }
      let resolvedValue = this.resolveXpath(value);
      if (mealIx !== undefined) {
        this.provider.mealSetXPathAssists[this.wizard.mealSetIndex][property][mealIx] = resolvedValue;
      }
      else {
        this.provider.mealSetXPathAssists[this.wizard.mealSetIndex][property] = resolvedValue;
      }
      return resolvedValue;
    }

    onEnterStep() {
      this.xpathService.getXDomainContent(this.provider.dailyMealUrl).subscribe(
          (data) => {
              this.dailyMealContents = data;
              this.xpathAssist("name");
              this.xpathAssist("price");
              for (let ix = 0; ix < this.provider.mealSetXPaths[this.wizard.mealSetIndex].meals.length; ix++) {
                this.xpathAssist("meals", ix);
              }
              this.changeDetectorRef.markForCheck();
          },
          (err) => {
            console.log(err);
          }
      );
    }

    addMealFragment(mealIndex:number, fragment:string) {
      this.provider.mealSetXPaths[this.wizard.mealSetIndex].meals[mealIndex] = this.provider.mealSetXPaths[this.wizard.mealSetIndex].meals[mealIndex] || '';
      this.provider.mealSetXPaths[this.wizard.mealSetIndex].meals[mealIndex] += '$' + fragment;
    }

    addMealSetFragment(fragment: string) {
      this.provider.mealSetXPaths[this.wizard.mealSetIndex].name = this.provider.mealSetXPaths[this.wizard.mealSetIndex].name || '';
      this.provider.mealSetXPaths[this.wizard.mealSetIndex].name += '$' + fragment;
    }

    addMealSetPriceFragment(fragment: string) {
      this.provider.mealSetXPaths[this.wizard.mealSetIndex].price = this.provider.mealSetXPaths[this.wizard.mealSetIndex].price || '';
      this.provider.mealSetXPaths[this.wizard.mealSetIndex].price += '$' + fragment;
    }

    isValid():boolean {
      return this.group.valid;
    }
}

function xpathResolverFactory(xpathService: XpathService, dailyMealContents: Holder<string>, resolvedXPaths: { [key: string]: string }) {
    return (control: Control) => {
        if (dailyMealContents.data) {
            try {
                let xpathMap = xpathService.resolveXPaths(dailyMealContents.data, control.value);
                resolvedXPaths[control.value] = xpathMap[control.value];
            }
            catch (err) {
                // XPath is invalid, do nothing
            }
        }
        return null;
    }
};
