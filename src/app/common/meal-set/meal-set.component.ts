import {Component, Input, ViewEncapsulation} from '@angular/core';
import {MealComponent} from '../meal/meal.component';
import {MealSet} from '../meal-set';

@Component({
    selector: 'meal-set',
    template: require('./meal-set.html'),
    directives: [MealComponent]
})
export class MealSetComponent {
  @Input()
  mealSet: MealSet;
}
