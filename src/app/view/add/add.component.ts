import {NgForm, ControlArray, ControlGroup, Control, FormBuilder, Validators, NgClass} from '@angular/common';
import {Component, Input, ViewChild} from '@angular/core';
import {DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {ModalComponent, MODAL_DIRECTIVES } from 'ng2-bs3-modal/ng2-bs3-modal';

import {EmitterService, Events} from '../../common/event';
import {MapService} from '../../common/map';
import {MealProvider, MealProviderService} from '../../common/meal-provider';
import {MealSetXPath} from '../../common/meal-set';
import {XpathTokens} from '../../common/xpath';

@Component({
    selector: 'add-view',
    providers: [MealProviderService, MapService],
    directives: [NgClass, MODAL_DIRECTIVES, DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES],
    template: require('./add.html')
})
export class AddComponent {
    @Input() mealProviders: MealProvider[];
    group: ControlGroup;
    provider: MealProvider;
    public wizard: Wizard;

    @ViewChild(ModalComponent)
    private modalComponent: ModalComponent;

    //TODO cached daily meal data to be used to validate XPath expression on each change

    constructor(
        private emitterService: EmitterService,
        private builder: FormBuilder,
        private mealProviderService: MealProviderService,
        private mapService: MapService) {
    }

    private createMealSetControlGroup(): ControlGroup {
        return this.builder.group({
            mealSetXpath: new Control(),
            mealSetPriceXpath: new Control(),
            meals: new ControlArray([this.createMealControl()])
        });
    }

    private createMealSetXPath(): MealSetXPath {
        return new MealSetXPath(null, null, []);
    }

    private createMealControl(): Control {
        return new Control();
    }

    ngOnInit() {
        this.provider = new MealProvider(null, null, {}, null, [this.createMealSetXPath()], null, null);
        this.group = this.builder.group({
            base: this.builder.group({
                name: ['', Validators.compose([Validators.required, duplicatedNameValidatorFactory(this.mealProviderService)])],
                homePage: new Control(),
                phone: new Control(),
                address: ['', Validators.required, addressValidatorFactory(this.mapService, this.provider)],
                dailyMealUrl: ['', Validators.compose([Validators.required, duplicatedDailyMealUrlValidatorFactory(this.mealProviderService)])],
                color: ['', Validators.compose([Validators.required, colorValidator])]
            }),
            mealSets: new ControlArray([this.createMealSetControlGroup()])
        });
        this.wizard = new Wizard(<ControlGroup>this.group.find('base'), <ControlArray>this.group.find('mealSets'));
    }

    public onAddMealSet() {
        this.wizard.addStep();
        this.provider.mealSetXPaths.splice(this.wizard.mealSetIndex + 1, 0, this.createMealSetXPath());
        (<ControlArray>this.group.find('mealSets')).insert(this.wizard.mealSetIndex + 1, this.createMealSetControlGroup());
        this.onNextStep();
    }

    public onRemoveMealSet() {
        this.wizard.removeCurrentStep();
        this.provider.mealSetXPaths.splice(this.wizard.mealSetIndex, 1);
        (<ControlArray>this.group.find('mealSets')).removeAt(this.wizard.mealSetIndex);
        this.onPreviousStep();
    }

    onNextStep() {
        if (/*this.group.valid && */this.wizard.step < this.wizard.lastStep) {
            this.wizard.step++;
        }
    }

    onPreviousStep() {
        if (/*this.group.valid && */this.wizard.step > 1) {
            this.wizard.step--;
        }
    }

    public onAddMeal() {
        this.provider.mealSetXPaths[this.wizard.mealSetIndex].meals.push('');
        (<ControlArray>(<ControlGroup>this.wizard.currentControl).find('meals')).push(this.createMealControl());
    }

    public onRemoveMeal(mealIndex: number) {
        if (this.provider.mealSetXPaths[this.wizard.mealSetIndex].meals.length > 1) {
            this.provider.mealSetXPaths[this.wizard.mealSetIndex].meals.splice(mealIndex, 1);
            (<ControlArray>(<ControlGroup>this.wizard.currentControl).find('meals')).removeAt(mealIndex);
        }
    }

    onClose() {
        this.modalComponent.close();
    }

    onSubmit() {
        this.mealProviderService.addMealProvider(this.provider);
        this.modalComponent.close();
        this.emitterService.get(Events.MEAL_PROVIDER_ADDED).emit(this.provider);
    }

    public open(): void {
        this.ngOnInit();
        this.modalComponent.open();
    }

    addXPathFragment(val:string):void {
      let meals:string[] = this.provider.mealSetXPaths[this.wizard.mealSetIndex].meals;
      meals[meals.length - 1] += '$' + val;
    }

    get xpathFragments():string[] {
      return XpathTokens.values();
    }
}

class Wizard {
    private _step: number;
    private _lastStep: number;
    private _mealSetIndex: number;
    private _currentControl: ControlGroup;

    constructor(private base: ControlGroup, private mealSets: ControlArray) {
        this._mealSetIndex = 0;
        this.step = 1;
        this._currentControl = this.base;
        this._lastStep = 1 + mealSets.controls.length;
    }

    public get step(): number {
        return this._step;
    }
    public set step(step: number) {
        this._step = step;
        if (step < 2) {
            this._mealSetIndex = 0;
            this._currentControl = this.base;
        }
        else {
            this._mealSetIndex = step - 2;
            this._currentControl = <ControlGroup>this.mealSets.controls[this._mealSetIndex];
        }
    }

    public get mealSetIndex(): number {
        return this._mealSetIndex;
    }

    public get currentControl(): ControlGroup {
        return this._currentControl;
    }

    public addStep(): void {
        this._lastStep++;
    }

    public removeCurrentStep(): void {
        this._lastStep--;
        if (this._lastStep < this._step) {
            this._step--;
        }
    }

    public get lastStep(): number {
        return this._lastStep;
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
            mapService.getLocation(control.value).subscribe(
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
