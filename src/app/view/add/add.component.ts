import {AfterViewInit, ChangeDetectorRef, Component, Input, QueryList, SimpleChange, ViewChild, ViewChildren} from '@angular/core';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/debounceTime';

import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

import {Wizard} from './wizard';
import {StepMainComponent} from './step-main';
import {StepMealSetComponent} from './step-mealset';

import {MapService} from '../../common/map';
import {MealProvider, MealProviderService} from '../../common/meal-provider';
import {MealSetXPath} from '../../common/meal-set';
import {DebounceInputControlValueAccessor} from '../../common/util';

import {EmitterService, Events} from '../../core/event';
import {XpathTokens, XpathService} from '../../core/xpath';


export const BASE_DATA_STEP = 1;

@Component({
    selector: 'dmb-add-view',
    providers: [MealProviderService, MapService],
    template: require('./add.html')
})
export class AddComponent {
    wizard: Wizard = new Wizard(0);
    BASE_DATA_STEP = BASE_DATA_STEP;
    submitInProgress = false;

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
        private xpathService: XpathService,
        private _changeDetectionRef : ChangeDetectorRef) {
    }

    ngOnInit() {
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
            // necessary otherwise we'll get the exception Expression has changed after it was checked
            // in dev mode because a change was triggered by change detection which would otherwise go unnoticed
            // and be effective only in the next change detection round
            this._changeDetectionRef.detectChanges();
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
        this.submitInProgress = true;
        this.mealProviderService.addMealProvider(this.provider);
        if (this.provider.isUninitialized()) {
            this.emitterService.get(Events.MEAL_PROVIDER_ADDED).emit(this.provider);
        }
        else {
            this.emitterService.get(Events.MEAL_PROVIDER_UPDATED).emit(this.provider);
        }
    }

    ngOnChanges(changes: {[propName: string]: SimpleChange}) {
      if (changes['provider']) {
        this.wizard = new Wizard(changes['provider'].currentValue.mealSetXPaths.length);
      }
    }

    public onSubmitComplete(): void {
        this.submitInProgress = false;
        this.modalComponent.close();
    }

    public open(): void {
        this.modalComponent.open();
    }

    static createEmptyProvider(): MealProvider {
        return new MealProvider(undefined, undefined, {}, undefined, [StepMealSetComponent.createMealSetXPath()], undefined, undefined, 0);
    }
}
