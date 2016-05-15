import {Component, ViewEncapsulation} from '@angular/core';
import {Meal} from '../meal';

@Component({
    selector: 'meal',
    template: require('./meal.html'),
    inputs: [
        'meal'
    ]
})
export class MealComponent {
   meal : Meal;
}
