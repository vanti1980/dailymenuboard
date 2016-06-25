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

    toJSON(): MealSetXPathJSON {
        return Object.assign({}, this);
    }

    static fromJSON(json: MealSetXPathJSON | string): MealSetXPath {
        if (typeof json === 'string') {
            return JSON.parse(json, MealSetXPath.reviver);
        } else {
            let mealSetXPath = Object.create(MealSetXPath.prototype);
            return Object.assign(mealSetXPath, json);
        }
    }

    static reviver(key: string, value: any): any {
        return key === "" ? MealSetXPath.fromJSON(value) : value;
    }

}

/**
 * Interface for JSON representation of MealSetXPath.
 */
export interface MealSetXPathJSON {
  /**
   * XPath to get name of MealSet
   */
  name: string;

  /**
   * XPath to get price of MealSet
   */
  price: string;

  /**
   * XPaths to get meals
   */
  meals: string[];
}
