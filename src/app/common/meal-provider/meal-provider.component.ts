import {Component, ViewEncapsulation} from '@angular/core';

import {Popover} from '../../common/popover';

import {MealSetComponent} from '../meal-set';
import {MealProvider} from './meal-provider.model';

import {MealProviderService} from './meal-provider.service';


@Component({
  selector: 'meal-provider',
  template: require('./meal-provider.html'),
  providers: [MealProviderService],
  directives: [Popover, MealSetComponent],
  inputs: [
      'mealProvider',
      'showMealSet'
  ]
})
export class MealProviderComponent {
   public mealProvider: MealProvider;
   public showMealSet: boolean;

   constructor(public mealProviderService: MealProviderService){

   }

   public removeMealProvider(providerToDelete:MealProvider){

      let array = this.mealProviderService.getCachedMealProviders();

      for(var i = array.length; i--;){
	       if (array[i].name === providerToDelete.name) {
             array.splice(i, 1);
          }
      }

      this.mealProviderService.cacheMealProviders(array);
   }
}
