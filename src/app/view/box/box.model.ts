import {BoxConfig}           from './box.config';
import { NgGrid, NgGridItem, NgGridConfig } from 'angular2-grid';
import {MealProvider}        from '../../common/meal-provider/meal-provider.model';

export class Box {
    public config : BoxConfig;
    public mealProvider : MealProvider;

   constructor (config: BoxConfig){
      this.config = config;
   }
}
