import {Component, ViewEncapsulation, ViewChild} from '@angular/core';
import {ConfirmComponent} from '../../common/confirm';
import {EmitterService, Events} from '../../common/event';

import {Popover} from '../../common/popover';

import {MealSetComponent} from '../meal-set';
import {MealProvider} from './meal-provider.model';

import {MealProviderService} from './meal-provider.service';


@Component({
  selector: 'meal-provider',
  template: require('./meal-provider.html'),
  providers: [MealProviderService],
  directives: [Popover, MealSetComponent, ConfirmComponent],
  inputs: [
      'mealProvider',
      'showMealSet'
  ]
})
export class MealProviderComponent {
   public mealProvider: MealProvider;
   public showMealSet: boolean;

   @ViewChild(ConfirmComponent)
   private confirmDialog: ConfirmComponent;


   constructor(
     private emitterService: EmitterService,
     public mealProviderService: MealProviderService){
   }

   openRemoveDialog(mealProvider: MealProvider) {
     this.confirmDialog.open(mealProvider);
   }

   confirmRemoveMealProvider(mealProvider: MealProvider) {
     this.mealProviderService.removeMealProvider(mealProvider);
     this.emitterService.get(Events.MEAL_PROVIDER_REMOVED).emit(mealProvider);
   }
}
