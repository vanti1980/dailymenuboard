import {Meal} from './meal.model';

/**
 * The class describes a set of meals that is provided as one and cannot be bought separately.
 */
export class MealSet {
    constructor(name: string,
        meals: Meal[],
        price: Price) {
    }
}

export class Price {
  constructor(value: number,
      currency: string) {
  }
}
