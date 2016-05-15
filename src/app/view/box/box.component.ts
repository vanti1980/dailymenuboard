import {Component, ViewEncapsulation} from '@angular/core';
import { NgGrid, NgGridItem } from 'angular2-grid';
import {MealProviderComponent,MealProvider,MealProviderService} from '../../common/meal-provider';
import {MapComponent} from '../../common/map';import {Box}        from './box.model';

@Component({
    selector: 'box-view',
    providers: [MealProviderService],
	directives: [NgGrid, NgGridItem, MealProviderComponent, MapComponent],    template: require('./box.html')
})
export class BoxView {

    public boxes: Box[] = [];
    public mealProviders: MealProvider[] = [];

    public maxNumberOfColumn : number;

    constructor(public mealProviderService: MealProviderService) {
        console.log('hello from BoxView');
        this.maxNumberOfColumn = 5;
    }


    ngOnInit() {
        console.log('ngOnInit');
        //this.mealProviderService.ngOnInit();



       this.mealProviderService.getDailyMealsByMealProviders().subscribe((array) => {

          for (var i = 0; i < array.length; i++) {
              console.log(array[i]);
              //TODO refactor, not too elegant
              this.mealProviders.push(array[i]);
              this.boxes.push(
                 new Box(
                    array[i],
                    (i % this.maxNumberOfColumn),
                    parseInt('' + (i / this.maxNumberOfColumn))
                 )
              );
          }
        });

    }

}
