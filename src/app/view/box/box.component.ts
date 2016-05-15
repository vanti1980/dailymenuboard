import {NgForm} from '@angular/common';
import {Component, ViewEncapsulation} from '@angular/core';
import { NgGrid, NgGridItem, NgGridConfig } from 'angular2-grid';

import {Observable} from 'rxjs/Rx';

import {MealProviderComponent, MealProvider, MealProviderService} from '../../common/meal-provider';
import {MapComponent} from '../../common/map';
import {Box}        from './box.model';
import {BoxConfig} from './box.config';

import {AddComponent} from '../add/add.component';

@Component({
    selector: 'box-view',
    providers: [MealProviderService],
    directives: [NgGrid, NgGridItem, MealProviderComponent, MapComponent, AddComponent],
    template: require('./box.html')
})
export class BoxView {

    public boxes: Box[];
    public mealProviders: Observable<MealProvider[]>;
    public maxNumberOfColumn: number;

    constructor(public mealProviderService: MealProviderService) {
        this.maxNumberOfColumn = 4;

        this.boxes = [
            new Box(new BoxConfig(1, 1)),
            new Box(new BoxConfig(1, 2)),
            new Box(new BoxConfig(4, 1)),
            new Box(new BoxConfig(4, 2))
        ];
    }


    ngOnInit() {
        //this.mealProviderService.ngOnInit();
        this.mealProviders = this.mealProviderService.getDailyMealsByMealProviders();
        this.mealProviders.subscribe((array) => {
            for (var i = 0; i < array.length; i++) {

                var provider = array[i];
                if (i <= this.boxes.length) {
                    //TODO refactor, not too elegant -> map
                    this.boxes[i].mealProvider = provider;

                } else {
                    console.error('You have reached the maximal number of boxes! We can show in this version of the application only ' + this.boxes.length + ' boxes');
                }
            }
        });
    }
}
