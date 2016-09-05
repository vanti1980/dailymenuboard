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

    /**
     * Position used to display meal provider.
     */
    @serialize @deserialize
    public position: number;

    /**
     * Distance from current location in meters.
     */
    public distance: number = 0;

    /**
     * Meal sets available
     */
    public mealSets: MealSet[] = [];

    mealSetXPathAssists: MealSetXPath[];

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
        color: string,
        position: number
    ) {
        this.name = name;
        this.homePage = homePage;
        this.contacts = contacts;
        this.dailyMealUrl = dailyMealUrl;
        this.mealSetXPaths = mealSetXPaths;
        if (mealSetXPaths) {
          this.mealSetXPathAssists = new Array(mealSetXPaths.length);
          this.mealSetXPathAssists.fill(new MealSetXPath());
        }
        this.color = color;
        this.position = position;
        this.location = location;
    }

    toJSON(): MealProviderJSON {
      return {
        name : this.name,
        homePage : this.homePage,
        contacts : this.contacts,
        dailyMealUrl : this.dailyMealUrl,
        mealSetXPaths : this.mealSetXPaths,
        color : this.color,
        position: this.position,
        location : this.location
      };
    }

    public isUninitialized(): boolean {
        return this._info.status == LoadStatus.NOT_LOADED;
    }

    public isLoaded(): boolean {
        return this._info.status == LoadStatus.LOADED;
    }

    public isEmpty(): boolean {
        return this._info.status == LoadStatus.EMPTY;
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

    public resetXPathAssists() {
      this.mealSetXPathAssists = [];
      this.mealSetXPaths.forEach((mealSetXPath) => this.mealSetXPathAssists.push(new MealSetXPath()));
    }

    public static OnDeserialized(instance : MealProvider, json : any) : void {
        if (instance.constructor.name === "MealProvider") {
          instance.mealSetXPathAssists = new Array(instance.mealSetXPaths.length);
          if (instance.mealSetXPaths) {
            instance.mealSetXPathAssists.fill(new MealSetXPath());
          }
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

  /**
   * Position used to display meal provider.
   */
  position: number;

}
