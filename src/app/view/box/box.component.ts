import {Component, ViewEncapsulation} from '@angular/core';
import { NgGrid, NgGridItem, NgGridConfig } from 'angular2-grid';
import {MealProviderComponent, MealProvider, MealProviderService} from '../../common/meal-provider';
import {MapComponent} from '../../common/map'; import {Box}        from './box.model';
import {BoxConfig} from './box.config';
@Component({
    selector: 'box-view',
    providers: [MealProviderService],
    directives: [NgGrid, NgGridItem, MealProviderComponent, MapComponent], template: require('./box.html')
})
export class BoxView {

    public boxes: Box[];
    public mealProviders: MealProvider[] = [];

    public maxNumberOfColumn: number;

    constructor(public mealProviderService: MealProviderService) {
        console.log('hello from BoxView');
        this.maxNumberOfColumn = 4;

        this.boxes = [
            new Box(new BoxConfig(0, 0)),
            new Box(new BoxConfig(1, 0)),
            new Box(new BoxConfig(0, 3)),
            new Box(new BoxConfig(1, 3))
        ];
    }


    ngOnInit() {
        console.log('ngOnInit');
        //this.mealProviderService.ngOnInit();



        this.mealProviderService.getDailyMealsByMealProviders().subscribe((array) => {

            for (var i = 0; i < array.length; i++) {

               var provider = array[i];
                console.log(provider);

                if (i <= this.boxes.length) {
                    //TODO refactor, not too elegant -> map
                    this.mealProviders.push(provider);

                    this.boxes[i].mealProvider = provider;

                } else {
                    console.error('you have reach the maximum number of boxes! we can show in tthis version only ' + this.boxes.length + ' boxes');
                }

         });

    }

}
