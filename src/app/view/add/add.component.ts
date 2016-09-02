import {NgForm, ControlArray, ControlGroup, Control, FormBuilder, Validators, NgClass} from '@angular/common';
import {AfterViewInit, Component, Input, QueryList, SimpleChange, ViewChild, ViewChildren} from '@angular/core';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/debounceTime';

import {DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {ModalComponent, MODAL_DIRECTIVES } from 'ng2-bs3-modal/ng2-bs3-modal';

import {Wizard} from './wizard';
import {StepMainComponent} from './step-main';
import {StepMealSetComponent} from './step-mealset';

import {EmitterService, Events} from '../../common/event';
import {MapService} from '../../common/map';
import {MealProvider, MealProviderService} from '../../common/meal-provider';
import {MealSetXPath} from '../../common/meal-set';
import {DebounceInputControlValueAccessor} from '../../common/util';
import {XpathTokens, XpathService} from '../../common/xpath';


export const BASE_DATA_STEP = 1;

@Component({
    selector: 'dmb-add-view',
    providers: [MealProviderService, MapService],
    directives: [NgClass, NgForm, MODAL_DIRECTIVES, StepMainComponent, StepMealSetComponent, DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES, DebounceInputControlValueAccessor],
    template: require('./add.html')
})
export class AddComponent {
    wizard: Wizard = new Wizard(0);
    BASE_DATA_STEP = BASE_DATA_STEP;

    @Input()
    provider: MealProvider;

    @ViewChild(ModalComponent)
    private modalComponent: ModalComponent;

    @ViewChild(StepMainComponent)
    private stepMainComponent: StepMainComponent;

    @ViewChildren(StepMealSetComponent)
    private stepMealSetComponents: QueryList<StepMealSetComponent>;

    constructor(
        private emitterService: EmitterService,
        private mealProviderService: MealProviderService,
        private mapService: MapService,
        private xpathService: XpathService) {
    }

    ngOnInit() {
        if (this.stepMainComponent) {
            this.stepMainComponent.ngOnInit();
        }
        if (this.stepMealSetComponents) {
            this.stepMealSetComponents.forEach((c) => {
                c.ngOnInit();
            });
        }
    }

    public getCurrentStepMealSet(): StepMealSetComponent {
        return this.wizard.step != BASE_DATA_STEP ? this.stepMealSetComponents.toArray()[this.wizard.step - 2] : null;
    }

    public onAddMealSet() {
        this.wizard.addStep();
        this.provider.mealSetXPaths.splice(this.wizard.mealSetIndex + 1, 0, StepMealSetComponent.createMealSetXPath());
        this.provider.mealSetXPathAssists.splice(this.wizard.mealSetIndex + 1, 0, StepMealSetComponent.createMealSetXPath());
        this.stepMealSetComponents.changes.subscribe((components) => {
            this.onNextStep();
        });
    }

    public onRemoveMealSet() {
        if (this.provider.mealSetXPaths.length > 1) {
            this.wizard.removeCurrentStep();
            this.provider.mealSetXPaths.splice(this.wizard.mealSetIndex, 1);
            this.provider.mealSetXPathAssists.splice(this.wizard.mealSetIndex, 1);
            this.onPreviousStep();
        }
    }

    onNextStep() {
        if (this.isCurrentStepValid() && this.wizard.step < this.wizard.lastStep) {
            this.wizard.step++;
            if (this.wizard.step == BASE_DATA_STEP) {
                this.stepMainComponent.onEnterStep();
            }
            else {
                this.getCurrentStepMealSet().onEnterStep();
            }
        }
    }

    onPreviousStep() {
        if (this.wizard.step > BASE_DATA_STEP) {
            this.wizard.step--;
            if (this.wizard.step == BASE_DATA_STEP) {
                this.stepMainComponent.onEnterStep();
            }
            else {
                this.getCurrentStepMealSet().onEnterStep();
            }
        }
    }

    isCurrentStepValid(): boolean {
        return this.wizard.step == BASE_DATA_STEP
            ? (this.stepMainComponent && this.stepMainComponent.isValid())
            : (this.getCurrentStepMealSet() && this.getCurrentStepMealSet().isValid());
    }

    isCurrentMealSetStepValid(): boolean {
        return this.wizard.step != BASE_DATA_STEP && this.isCurrentStepValid();
    }

    onClose() {
        this.modalComponent.close()
        this.emitterService.get(Events.MEAL_PROVIDER_DISCARDED).emit(this.provider);
    }

    onDismiss() {
        this.modalComponent.close();
        this.emitterService.get(Events.MEAL_PROVIDER_DISCARDED).emit(this.provider);
    }

    onSubmit() {
        this.mealProviderService.addMealProvider(this.provider);
        if (this.provider.isUninitialized()) {
            this.emitterService.get(Events.MEAL_PROVIDER_ADDED).emit(this.provider);
        }
        else {
            this.emitterService.get(Events.MEAL_PROVIDER_UPDATED).emit(this.provider);
        }
        this.modalComponent.close();
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
      if (changes['provider']) {
        this.wizard = new Wizard(changes['provider'].currentValue.mealSetXPaths.length);
      }
    }

    public open(): void {
        this.modalComponent.open();
    }
}
