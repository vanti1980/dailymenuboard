import {Component, ViewEncapsulation} from '@angular/core';

import {Popover} from '../../common/popover';

import {MealSetComponent} from '../meal-set';

@Component({
  selector: 'meal-provider',
  template: require('./meal-provider.html'),
  directives: [Popover, MealSetComponent],
  inputs: [
      'value'
  ]
})
export class MealProvderComponent {
   value: MealSetComponent;

}
