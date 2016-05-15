import {Location} from '../map';
import {MealSet} from '../meal-set/meal-set.model';

/**
 * Restaurant or something else that offers the meal.
 */
export class MealProvider {

    /**
     * Distance from current location in meters.
     */
    public distance: number = 0;

    /**
     * Meal sets available
     */
    public mealSets: MealSet[] = [];

    constructor(
        public name: string,
        public homePage: string,
        public contacts: { [key: string]: string },
        public dailyMealUrl: string,
        public mealSetQueryXPath: { [key: string]: string },
        public dailyMealQueryXPathByMealSet: { [key: string]: string[] },
        public mealSetPriceQueryXPathByMealSet: { [key: string]: string },
        public location: Location,
        public color: string
    ) { }

    toJSON(): MealProviderJSON {
        return Object.assign({}, this);
    }

    static fromJSON(json: MealProviderJSON | string): MealProvider {
        if (typeof json === 'string') {
            return JSON.parse(json, MealProvider.reviver);
        } else {
            let mealProvider = Object.create(MealProvider.prototype);
            return Object.assign(mealProvider, json);
        }
    }

    static reviver(key: string, value: any): any {
        return key === "" ? MealProvider.fromJSON(value) : value;
    }
}

/**
 * Interface for JSON representation of MealProvider.
 */
export interface MealProviderJSON {
    /**
     * Name of the restaurant/trattoria etc.
     */
    name: string;

    /**
     * The page where it is available.
     */
    homePage: string;

    /**
     * Available contacts.
     */
    contacts: { [key: string]: string };

    /**
     * URL where daily meal is available
     */
    dailyMealUrl: string;

    /**
     * XPath to query daily meal
     */
    dailyMealQueryXPathByMealSet: { [key: string]: string[] };

    /**
     * Location
     */
    location: Location;

    /**
     * Color used to display meal provider.
     */
    color: string;

}
