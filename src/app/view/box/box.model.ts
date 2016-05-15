import {BoxConfig}           from './box.config';
import { NgGrid, NgGridItem, NgGridConfig } from 'angular2-grid';
import {MealProvider}        from '../../common/meal-provider/meal-provider.model';

export class Box {
    public config : NgGridConfig;
    public mealProvider : MealProvider;

/*
    constructor(mealProvider: MealProvider, column: number, row: number) {
        console.log('column:' + column);
        console.log('row   :' + row);
        this.config.col = column;
        this.config.row = row;
        this.mealProvider = mealProvider;
    }
    */

   constructor (config: NgGridConfig){
      this.config = config;
   }
}
