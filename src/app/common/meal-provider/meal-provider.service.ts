import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Rx';

import {Meal} from '../meal';

import {Price} from '../meal/price.model';

import {MealSet, MealSetXPath} from '../meal-set/meal-set.model';

import {MealProvider} from './meal-provider.model';

import {XpathService, XpathResolutionResult} from '../xpath/xpath.service';

import {MapService} from '../map/map.service';

const KEY_MEAL_PROVIDERS = 'mealProviders';

@Injectable()
export class MealProviderService {

    constructor(private xpathService: XpathService, private mapService: MapService) {
        this.init();
    }

    init() {
        // create mock data
        if (this.getCachedMealProviders().length == 0) {
            this.prepareMockData();
        }
    }

    private prepareMockData() {
        this.cacheMealProviders([
            new MealProvider(
                'Bonnie',
                'http://www.bonnierestro.hu',
                {
                    phone: '+36307443555'
                },
                'http://www.bonnierestro.hu/hu/napimenu/',
                [
                    new MealSetXPath(undefined, undefined, [
                        '//div[@id="content"]//h4[text()[contains(.,"$dayOfMonth")]]/following-sibling::table[4]//tr[2]/td[3]',
                        '//div[@id="content"]//h4[text()[contains(.,"$dayOfMonth")]]/following-sibling::table[4]//tr[3]/td[3]',
                    ])
                ],
                {
                    lat: 47.4921,
                    lng: 19.0560
                },
                '55e5e5'
            ),
            new MealProvider(
                'Chic-to-Chic',
                'http://www.chictochic.hu',
                {
                    address: '1056 Budapest, Irányi u. 27.',
                    phone: '+3612670331'
                },
                'http://www.chictochic.hu/?nav=daily',
                [
                    new MealSetXPath(
                        '//*[@id="content-text"]/table[2]//td[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"),"$dayOfWeek")]/../following-sibling::tr[1]/td[2]/b',
                        '//*[@id="content-text"]/table[2]//td[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"),"$dayOfWeek")]/../following-sibling::tr[1]/td[3]',
                        [
                            '//*[@id="content-text"]/table[2]//td[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"),"$dayOfWeek")]/../following-sibling::tr[1]/td[2]/div'
                        ]
                    )
                ],
                {
                    lat: 47.4918,
                    lng: 19.0541
                },
                'ff5b9c'
            )
        ]);
    }

    public addMealProvider(mealProvider: MealProvider) {
        let mealProviders: Array<MealProvider> = this.getCachedMealProviders().filter((existingProvider) => existingProvider.name != mealProvider.name);
        mealProviders.push(mealProvider);
        localStorage.setItem(KEY_MEAL_PROVIDERS, JSON.stringify(mealProviders));
    }

    public removeMealProvider(mealProvider: MealProvider) {
        let mealProviders: Array<MealProvider> = this.getCachedMealProviders().filter((existingProvider) => existingProvider.name != mealProvider.name);
        localStorage.setItem(KEY_MEAL_PROVIDERS, JSON.stringify(mealProviders));
    }

    public cacheMealProviders(mealProviders: MealProvider[]) {
        localStorage.setItem(KEY_MEAL_PROVIDERS, JSON.stringify(mealProviders));
    }

    public getCachedMealProviders(): MealProvider[] {
        var mealProviderString = localStorage.getItem(KEY_MEAL_PROVIDERS);
        if (mealProviderString) {
            try {
                return JSON.parse(mealProviderString);
            }
            catch (e) {
                console.error(e);
            }
        }
        return [];
    }

    private getDailyMealProviders(): Observable<MealProvider> {
        var providersByUrl: { [key: string]: MealProvider } = {};
        var providerXPaths: Observable<XpathResolutionResult>[] = new Array<Observable<XpathResolutionResult>>();

        this.getCachedMealProviders()
            .forEach((provider: MealProvider) => {
                providersByUrl[provider.dailyMealUrl] = provider;
                var xpaths: string[] = [];
                for (let mealSetXPath of provider.mealSetXPaths) {
                    xpaths.push(mealSetXPath.name);
                    xpaths = [...xpaths, mealSetXPath.price, ...mealSetXPath.meals];
                }
                providerXPaths.push(
                    this.xpathService.resolveXPaths(provider.dailyMealUrl, ...xpaths)
                        .catch(() => Observable.of(<XpathResolutionResult>{ url: provider.dailyMealUrl, xpathResult: {} }))
                );
            });

        return Observable.of(providerXPaths)
            .flatMap((xpaths) => xpaths)
            .mergeAll()
            .map((providerXPath: XpathResolutionResult) => {
                let provider = providersByUrl[providerXPath.url];
                let xpaths = providerXPath.xpathResult;
                let mealSets: MealSet[] = [];

                for (let mealSetXPath of provider.mealSetXPaths) {
                    let meals: Meal[] = [];
                    for (let mealXPath of mealSetXPath.meals) {
                        if (xpaths[mealXPath]) {
                            meals.push(new Meal(xpaths[mealXPath].trim()));
                        }
                    }
                    let price: Price = null;
                    if (mealSetXPath.price) {
                        price = Price.fromString(xpaths[mealSetXPath.price]);
                    }
                    let mealSet: MealSet = new MealSet(xpaths[mealSetXPath.name], meals, price, provider);
                    mealSets.push(mealSet);
                }
                provider.mealSets = mealSets;
                if (provider.location) {
                    provider.distance = this.mapService.calculateDistance(provider.location, this.mapService.getCachedHome().location);
                }
                console.log("$$$$$mealProvider=" + JSON.stringify(provider));
                return provider;
            });
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
