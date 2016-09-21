import {Component, Input, ViewChild} from '@angular/core';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/debounceTime';

import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

import {MapService} from '../../common/map';
import {MealProvider, MealProviderService} from '../../common/meal-provider';
import {MealSetXPath} from '../../common/meal-set';
import {DebounceInputControlValueAccessor} from '../../common/util';

import {EmitterService, Events} from '../../core/event';
import {XpathTokens, XpathService} from '../../core/xpath';


const BASE_DATA_STEP = 1;

export class Wizard {
    private _step: number;
    private _lastStep: number;
    private _mealSetIndex: number;

    constructor(initialMealSetCount: number) {
        this._mealSetIndex = 0;
        this.step = BASE_DATA_STEP;
        this._lastStep = BASE_DATA_STEP + (initialMealSetCount > 0 ? initialMealSetCount : 1);
    }

    public get step(): number {
        return this._step;
    }
    public set step(step: number) {
        this._step = step;
        if (step < 2) {
            this._mealSetIndex = 0;
        }
        else {
            this._mealSetIndex = step - 2;
        }
    }

    public get mealSetIndex(): number {
        return this._mealSetIndex;
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
