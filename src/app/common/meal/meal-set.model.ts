import {Meal} from './meal.model';

/**
 * The class describes a set of meals that is provided as one and cannot be bought separately.
 */
export class MealSet {
  name: string;
  meals: Meal[];
  price: number;
}
