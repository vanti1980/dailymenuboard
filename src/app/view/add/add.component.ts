import {NgForm, ControlArray, ControlGroup, Control, FormBuilder, Validators, NgClass} from '@angular/common';
import {Component} from '@angular/core';
import { MODAL_DIRECTIVES } from 'ng2-bs3-modal/ng2-bs3-modal';

import {MealProvider, MealProviderService} from '../../common/meal-provider';
import {MealSetXPath} from '../../common/meal-set';

@Component({
    selector: 'add-view',
    providers: [MealProviderService],
    directives: [NgClass, MODAL_DIRECTIVES],
    template: require('./add.html')
})
export class AddComponent {

    group: ControlGroup;
    provider: MealProvider;
    public wizard: Wizard;
    public dialogOpen: boolean = true;

    constructor(private builder: FormBuilder, private mealProviderService: MealProviderService) {
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

    public log(obj: any) {
        for (var key in obj) {
            console.log(key + "=" + obj[key]);
        }
    }

    ngOnInit() {
        this.provider = new MealProvider(null, null, {}, null, [this.createMealSetXPath()], null, null);
        this.group = this.builder.group({
            base: this.builder.group({
                name: ['', Validators.compose([Validators.required, duplicatedValidatorFactory(this.mealProviderService, this.provider)])],
                homePage: new Control(),
                phone: new Control(),
                address: new Control(),
                dailyMealUrl: new Control(),
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
        console.log('before: valid=' + this.group.valid + ', currentStep=' + this.wizard.step + ', lastStep=' + this.wizard.lastStep + ', mealSetIndex=' + this.wizard.mealSetIndex + ', currentControl=' + this.wizard.currentControl);
        if (/*this.group.valid && */this.wizard.step < this.wizard.lastStep) {
            this.wizard.step++;
            console.log('after: valid=' + this.group.valid + ', currentStep=' + this.wizard.step + ', lastStep=' + this.wizard.lastStep + ', mealSetIndex=' + this.wizard.mealSetIndex + ', currentControl=' + this.wizard.currentControl);
        }
    }

    onPreviousStep() {
        console.log('before: valid=' + this.group.valid + ', currentStep=' + this.wizard.step + ', lastStep=' + this.wizard.lastStep + ', mealSetIndex=' + this.wizard.mealSetIndex + ', currentControl=' + this.wizard.currentControl);
        if (/*this.group.valid && */this.wizard.step > 1) {
            this.wizard.step--;
            console.log('after: valid=' + this.group.valid + ', currentStep=' + this.wizard.step + ', lastStep=' + this.wizard.lastStep + ', mealSetIndex=' + this.wizard.mealSetIndex + ', currentControl=' + this.wizard.currentControl);
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
        this.ngOnInit();
        this.dialogOpen = false;
    }

    onSubmit() {
        console.log(JSON.stringify(this.provider));
        this.ngOnInit();
        this.dialogOpen = false;
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

function duplicatedValidatorFactory(mealProviderService: MealProviderService, currentProvider: MealProvider) {
    return (control: Control) => {
        for (let mealProvider of mealProviderService.getCachedMealProviders()) {
            if (mealProvider.name == currentProvider.name) {
                return { 'duplicated': true };
            }
        }

    }
}
