import {Component, ViewEncapsulation} from '@angular/core';
import { NgGrid, NgGridItem } from 'angular2-grid';
import {MealProvider}        from '../../common/meal-provider/meal-provider.model';
import {MealProviderService} from '../../common/meal-provider/meal-provider.service';
import {Box}        from './box.model';

@Component({
    selector: 'box-view',
    providers: [MealProviderService],
    directives: [NgGrid, NgGridItem],
    template: require('./box.html')
})
export class BoxView {

    public boxes: Box[] = [];

    public maxNumberOfColumn : number;

    constructor(public mealProviderService: MealProviderService) {
        console.log('hello from BoxView');
        this.maxNumberOfColumn = 3;
    }


    ngOnInit() {
        console.log('ngOnInit');
        //this.mealProviderService.ngOnInit();



        var array = this.mealProviderService.getCachedMealProviders();
        for (var i = 0; i < array.length; i++) {
            console.log(array[i]);
            this.boxes.push(
               new Box(
                  array[i],
                  (i % this.maxNumberOfColumn),
                  parseInt('' + (i / this.maxNumberOfColumn))
               )
            );
        }
    }

}
