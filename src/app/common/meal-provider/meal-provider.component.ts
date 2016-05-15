import {Component, ViewEncapsulation} from '@angular/core';

import {Popover} from '../../common/popover';

import {MealSetComponent} from '../meal-set';
import {MealProvider} from './meal-provider.model';

@Component({
  selector: 'meal-provider',
  template: require('./meal-provider.html'),
  directives: [Popover, MealSetComponent],
  inputs: [
      'mealProvider'
  ]
})
export class MealProvderComponent {
   mealProvider: MealProvider;

}
