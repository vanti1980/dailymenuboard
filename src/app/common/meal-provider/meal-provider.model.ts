import { deserialize, deserializeAs, serialize, serializeAs } from 'cerialize';

import {Location} from '../map';
import {MealSet, MealSetXPath, MealSetXPathJSON} from '../meal-set/meal-set.model';
import {LoadInfo, LoadStatus} from '../util';

/**
 * Restaurant or something else that offers the meal.
 */
export class MealProvider implements MealProviderJSON {
    /**
     * Name of the restaurant/trattoria etc.
     */
    @serialize @deserialize
    public name: string;

    /**
     * The page where it is available.
     */
    @serialize @deserialize
    public homePage: string;

    /**
     * Available contacts.
     */
    @serialize @deserialize
    public contacts: { [key: string]: string };

    /**
     * URL where daily meal is available
     */
    @serialize @deserialize
    public dailyMealUrl: string;

    /**
     * Array of XPath composite objects
     */
    @serializeAs(MealSetXPath) @deserializeAs(MealSetXPath)
    public mealSetXPaths: MealSetXPath[];

    /**
     * Location
     */
    @serializeAs(Location) @deserializeAs(Location)
    public location: Location;

    /**
     * Color used to display meal provider.
     */
    @serialize @deserialize
    public color: string;

    private key: number = Math.random();

    private _isNew: boolean = false;

    /**
     * Distance from current location in meters.
     */
    public distance: number = 0;

    /**
     * Meal sets available
     */
    public mealSets: MealSet[] = [];

    /**
     * Status about the meal provider being loaded or not loaded.
     */
    private _info: LoadInfo = new LoadInfo(LoadStatus.NOT_LOADED);

    constructor(
        name: string,
        homePage: string,
        contacts: { [key: string]: string },
        dailyMealUrl: string,
        mealSetXPaths: MealSetXPath[],
        location: Location,
        color: string
    ) {
        this.name = name;
        this.homePage = homePage;
        this.contacts = contacts;
        this.dailyMealUrl = dailyMealUrl;
        this.mealSetXPaths = mealSetXPaths;
        this.color = color;
        this.location = location;

        if (!name) {
            this._isNew = true;
        }
    }

    toJSON(): MealProviderJSON {
      return {
        name : this.name,
        homePage : this.homePage,
        contacts : this.contacts,
        dailyMealUrl : this.dailyMealUrl,
        mealSetXPaths : this.mealSetXPaths,
        color : this.color,
        location : this.location
      };
    }

    public get isNew(): boolean {
        return this._isNew;
    }

    public isLoaded(): boolean {
        return this._info.status == LoadStatus.LOADED;
    }

    public hasErrors(): boolean {
        return this._info.status == LoadStatus.ERROR;
    }

    public setStatus(status: LoadStatus, errorMsg?: string) {
      if (errorMsg) {
        this._info = new LoadInfo(status, errorMsg);
      }
      else {
        this._info = new LoadInfo(status);
      }
    }
}

export interface MealProviderJSON {
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
   * Array of XPath composite objects
   */
  mealSetXPaths: MealSetXPath[];

  /**
   * Location
   */
  location: Location;

  /**
   * Color used to display meal provider.
   */
  color: string;
}
