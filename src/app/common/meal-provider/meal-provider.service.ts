import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Rx';

import { Serialize, Deserialize } from 'cerialize';

import {MapService} from '../map';

import {Meal, Price} from '../meal';

import {MealSet, MealSetXPath} from '../meal-set';

import {MealProvider} from './meal-provider.model';

import {XpathService, XpathResolutionResult} from '../../core/xpath/xpath.service';

import {LoadInfo, LoadStatus} from '../util';

const KEY_MEAL_PROVIDERS = 'mealProviders';

@Injectable()
export class MealProviderService {

    constructor(private xpathService: XpathService, private mapService: MapService) {
        this.init();
    }

    init() {
        // create mock data
        if (this.getCachedMealProviders().length === 0) {
            this.prepareMockData();
        }
    }

    private prepareMockData() {
        var mockData: MealProvider[] = Deserialize(require('../../../assets/mock-data/mock-data.json'), MealProvider);
        this.cacheMealProviders(mockData);
    }

    public addMealProvider(mealProvider: MealProvider) {
        let mealProviders: Array<MealProvider> = this.getCachedMealProviders().filter((existingProvider) => existingProvider.name != mealProvider.name);
        mealProviders.push(mealProvider);
        localStorage.setItem(KEY_MEAL_PROVIDERS, JSON.stringify(Serialize(mealProviders)));
    }

    public removeMealProvider(mealProvider: MealProvider) {
        let mealProviders: Array<MealProvider> =
          this.getCachedMealProviders().filter((existingProvider) => existingProvider.name !== mealProvider.name);
        localStorage.setItem(KEY_MEAL_PROVIDERS, JSON.stringify(Serialize(mealProviders)));
    }

    public cacheMealProviders(mealProviders: MealProvider[]) {
        let storedMealProviders: MealProvider[] = [];
        localStorage.setItem(KEY_MEAL_PROVIDERS, JSON.stringify(Serialize(mealProviders.filter((mealProvider)=>(mealProvider !== null && mealProvider !== undefined)))));
    }

    public getCachedMealProviders(): MealProvider[] {
        let mealProviderString = localStorage.getItem(KEY_MEAL_PROVIDERS);
        if (mealProviderString) {
            try {
                let mealProviders: MealProvider[] = Deserialize(JSON.parse(mealProviderString), MealProvider);
                return mealProviders;
            } catch (e) {
                console.error(e);
            }
        }
        return [];
    }

    private getDailyMealProviders(): Observable<MealProvider> {
        let providersByUrl: { [key: string]: MealProvider } = {};
        let providerXPaths: Observable<XpathResolutionResult>[] = new Array<Observable<XpathResolutionResult>>();

        this.getCachedMealProviders()
            .forEach((provider: MealProvider) => {
                providersByUrl[provider.dailyMealUrl] = provider;
                let xpaths: string[] = [];
                for (let mealSetXPath of provider.mealSetXPaths) {
                    xpaths.push(mealSetXPath.name);
                    xpaths = [...xpaths, mealSetXPath.price, ...mealSetXPath.meals];
                }
                providerXPaths.push(
                    this.xpathService.loadAndResolveXPaths(provider.dailyMealUrl, ...xpaths)
                        .catch((err) => {
                          provider.setStatus(LoadStatus.ERROR, err);
                          return Observable.of(<XpathResolutionResult>{ url: provider.dailyMealUrl, xpathResult: {}});
                        })
                );
            });

        return Observable.of(providerXPaths)
            .flatMap((xpaths) => xpaths)
            .mergeAll()
            .map((providerXPath: XpathResolutionResult) => {
                let provider = providersByUrl[providerXPath.url];
                let xpaths = providerXPath.xpathResult;
                let mealSets: MealSet[] = [];
                provider.mealSetXPathAssists = [];

                for (let mealSetXPath of provider.mealSetXPaths) {
                    let meals: Meal[] = [];
                    for (let mealXPath of mealSetXPath.meals) {
                        if (xpaths[mealXPath]) {
                            meals.push(new Meal(xpaths[mealXPath].trim()));
                        }
                    }
                    let price: Price = undefined;
                    if (mealSetXPath.price) {
                        price = Price.fromString(xpaths[mealSetXPath.price]);
                    }
                    let name: string = xpaths[mealSetXPath.name];
                    if (name) {
                      let mealSet: MealSet = new MealSet(name, meals, price, provider);
                      mealSets.push(mealSet);
                      provider.mealSetXPathAssists.push(new MealSetXPath());
                    }
                }
                provider.mealSets = mealSets;
                if (!provider.hasErrors()) {
                  provider.setStatus(provider.mealSets.length === 0 ? LoadStatus.EMPTY : LoadStatus.LOADED);
                }
                if (provider.location) {
                    provider.distance = this.mapService.calculateDistance(provider.location, this.mapService.getCachedHome().location);
                }
                return provider;
            })
            ;
    }

    public getDailyMealsByMealProviders(): Observable<Array<MealProvider>> {
        return this.getDailyMealProviders()
            .reduce((ar: MealProvider[], provider: MealProvider) => {
                ar.push(provider);
                return ar;
            }, new Array<MealProvider>());
    }

    public getDailyMealsByMealSets(): Observable<Array<MealSet>> {
        return this.getDailyMealProviders()
            .map((provider: MealProvider) => provider.mealSets)
            .reduce((ar: MealSet[], mealSet: MealSet[]) => {
                ar.push(...mealSet);
                return ar;
            }, new Array<MealSet>());
    }

}
