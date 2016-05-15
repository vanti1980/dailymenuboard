import {Component, ViewEncapsulation} from '@angular/core';
import { NgGrid, NgGridItem, NgGridConfig } from 'angular2-grid';

import {Observable} from 'rxjs/Rx';

import {TranslatePipe} from 'ng2-translate/ng2-translate';

import {MealProviderComponent, MealProvider, MealProviderService} from '../../common/meal-provider';
import {MapComponent} from '../../common/map';
import {Box}        from './box.model';
import {BoxConfig} from './box.config';

@Component({
    selector: 'box-view',
    providers: [MealProviderService],
    pipes: [TranslatePipe],
    directives: [NgGrid, NgGridItem, MealProviderComponent, MapComponent], template: require('./box.html')
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
                console.log(provider);
                if (i <= this.boxes.length) {
                    //TODO refactor, not too elegant -> map
                    this.boxes[i].mealProvider = provider;

                } else {
                    console.error('you have reach the maximum number of boxes! we can show in tthis version only ' + this.boxes.length + ' boxes');
                }
              }
         });
    }

}
