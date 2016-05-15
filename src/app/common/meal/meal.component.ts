import {Component, ViewEncapsulation} from '@angular/core';
import {Meal} from '../meal';

@Component({
    selector: 'meal',
    template: require('./meal.html'),
    inputs: [
        'value'
    ]
})
export class MealComponent {
   value : Meal;
}
