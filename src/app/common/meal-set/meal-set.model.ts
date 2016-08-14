import { deserialize, deserializeAs, serialize, serializeAs } from 'cerialize';

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
}

/**
 * The class describes a structure to define XPaths for a meal set.
 */
export class MealSetXPath {

  @serialize @deserialize
  name: string;

  @serialize @deserialize
  price: string;

  @serialize @deserialize
  meals: string[];

  constructor(
      name?: string,
      price?: string,
      meals?: string[])
    {
      this.name = name;
      this.price = price;
      this.meals = meals || [];
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
