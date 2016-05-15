import {Component, ViewEncapsulation} from '@angular/core';
import {MealComponent} from '../meal/meal.component';
import {MealSet} from '../meal-set';

@Component({
    selector: 'meal-set',
    template: require('./meal-set.html'),
    directives: [MealComponent],
    inputs: [
        'mealSet'
    ]
})
export class MealSetComponent {
   mealSet : MealSet;
}
