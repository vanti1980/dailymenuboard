import {BoxConfig}           from './box.config';
import {MealProvider}        from '../../common/meal-provider/meal-provider.model';

export class Box {
    public config: BoxConfig = new BoxConfig();
    public mealProvider: MealProvider;

    constructor(mealProvider: MealProvider, column: number, row: number) {
        console.log('column:' + column);
        console.log('row   :' + row);
        this.config.col = column;
        this.config.row = row;
        this.mealProvider = mealProvider;
    }
}
