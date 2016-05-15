import {Component, ViewEncapsulation} from '@angular/core';

import {MealComponent} from '../meal/meal.component';

@Component({
    selector: 'meal-set',
    template: require('./meal-set.html'),
    directives: [MealComponent],
    inputs: [
        'value'
    ]
})
export class MealSetComponent {

   value : MealComponent;


}
