import {Component, Input, ViewEncapsulation, ViewChild} from '@angular/core';

import {ConfirmComponent} from '../../common/confirm';

import {EmitterService, Events} from '../../core/event';

import {MealSetComponent} from '../meal-set';
import {MealProvider, MealProviderService} from '../meal-provider';


@Component({
  selector: 'meal-provider',
  template: require('./meal-provider.html')
})
export class MealProviderComponent {
  @Input()
  public mealProvider: MealProvider;

  @Input()
  public showMealSet: boolean;

   @ViewChild(ConfirmComponent)
   confirmDialog: ConfirmComponent;


   constructor(
     private emitterService: EmitterService,
     public mealProviderService: MealProviderService){
   }

   openEditDialog(mealProvider: MealProvider) {
     this.emitterService.get(Events.MEAL_PROVIDER_EDITED).emit(mealProvider);
   }

   openRemoveDialog(mealProvider: MealProvider) {
     this.confirmDialog.open(mealProvider);
   }

   confirmRemoveMealProvider(mealProvider: MealProvider) {
     this.mealProviderService.removeMealProvider(mealProvider);
     this.emitterService.get(Events.MEAL_PROVIDER_REMOVED).emit(mealProvider);
   }
}
