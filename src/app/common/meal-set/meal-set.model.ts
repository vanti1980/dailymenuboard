import {Meal} from '../meal/meal.model';
import {Price} from '../meal/price.model';
import {MealProvider} from '../meal-provider';
/**
 * The class describes a set of meals that is provided as one and cannot be bought separately.
 */
export class MealSet {

 constructor(
        public name: string,
        public meals: Meal[],
        public price: Price,
        public mealProvider : MealProvider) {
        }
  toJSON() {
      return {
        name: this.name,
        meals: this.meals,
        price: this.price
      };
  }

}

/**
 * The class describes a structure to define XPaths for a meal set.
 */
export class MealSetXPath {
  constructor(
      public name: string,
      public price: string,
      public meals: string[]) {
    }
}
