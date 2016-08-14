import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Rx';

import { Serialize, Deserialize } from 'cerialize';

import {Meal} from '../meal';

import {Price} from '../meal/price.model';

import {MealSet, MealSetXPath} from '../meal-set/meal-set.model';

import {MealProvider} from './meal-provider.model';

import {XpathService, XpathResolutionResult} from '../xpath/xpath.service';

import {MapService} from '../map/map.service';

import {LoadInfo, LoadStatus} from '../util';

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
                    address: 'Budapest, Ferenciek tere 5',
                    phone: '+36307443555'
                },
                'http://www.bonnierestro.hu/hu/napimenu/',
                [
                    new MealSetXPath(
                        'substring(normalize-space(//div[@id="content"]//h2/text()), 1, 10)',
                        'substring(normalize-space(//div[@id="content"]//h2/text()), 12, 7)',
                    [
                        '//div[@id="content"]//h4[text()[contains(.,"$firstDayOfWeek")]]/following-sibling::table[$numberOfWeekDay]//tr[2]/td[3]',
                        '//div[@id="content"]//h4[text()[contains(.,"$firstDayOfWeek")]]/following-sibling::table[$numberOfWeekDay]//tr[3]/td[3]',
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
                        '//*[@id="content-text"]/table[2]//td[contains(text(), "$dayOfWeekCapFirst")]/../following-sibling::tr[1]/td[2]/b',
                        '//*[@id="content-text"]/table[2]//td[contains(text(), "$dayOfWeekCapFirst")]/../following-sibling::tr[1]/td[3]',
                        [
                            '//*[@id="content-text"]/table[2]//td[contains(text(), "$dayOfWeekCapFirst")]/../following-sibling::tr[1]/td[2]/div/text()[1]',
                            '//*[@id="content-text"]/table[2]//td[contains(text(), "$dayOfWeekCapFirst")]/../following-sibling::tr[1]/td[2]/div/text()[2]'
                        ]
                    ),
                    new MealSetXPath(
                        '//*[@id="content-text"]/table[2]//td[contains(text(), "$dayOfWeekCapFirst")]/../following-sibling::tr[2]/td[2]/b',
                        '//*[@id="content-text"]/table[2]//td[contains(text(), "$dayOfWeekCapFirst")]/../following-sibling::tr[2]/td[3]',
                        [
                            '//*[@id="content-text"]/table[2]//td[contains(text(), "$dayOfWeekCapFirst")]/../following-sibling::tr[2]/td[2]/div/text()[1]',
                            '//*[@id="content-text"]/table[2]//td[contains(text(), "$dayOfWeekCapFirst")]/../following-sibling::tr[2]/td[2]/div/text()[2]'
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
        localStorage.setItem(KEY_MEAL_PROVIDERS, JSON.stringify(Serialize(mealProviders)));
    }

    public removeMealProvider(mealProvider: MealProvider) {
        let mealProviders: Array<MealProvider> = this.getCachedMealProviders().filter((existingProvider) => existingProvider.name != mealProvider.name);
        localStorage.setItem(KEY_MEAL_PROVIDERS, JSON.stringify(Serialize(mealProviders)));
    }

    public cacheMealProviders(mealProviders: MealProvider[]) {
        localStorage.setItem(KEY_MEAL_PROVIDERS, JSON.stringify(Serialize(mealProviders)));
    }

    public getCachedMealProviders(): MealProvider[] {
        var mealProviderString = localStorage.getItem(KEY_MEAL_PROVIDERS);
        if (mealProviderString) {
            try {
                let mealProviders: MealProvider[] = Deserialize(JSON.parse(mealProviderString), MealProvider);
                return mealProviders;
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
                    this.xpathService.loadAndResolveXPaths(provider.dailyMealUrl, ...xpaths)
                        .catch((err) => {
                          provider.setStatus(LoadStatus.ERROR, err);
                          return Observable.of(<XpathResolutionResult>{ url: provider.dailyMealUrl, xpathResult: {}})
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
                    let price: Price = null;
                    if (mealSetXPath.price) {
                        price = Price.fromString(xpaths[mealSetXPath.price]);
                    }
                    let mealSet: MealSet = new MealSet(xpaths[mealSetXPath.name], meals, price, provider);
                    mealSets.push(mealSet);
                    provider.mealSetXPathAssists.push(new MealSetXPath());
                }
                provider.mealSets = mealSets;
                if (!provider.hasErrors()) {
                  provider.setStatus(provider.mealSets.length == 0 ? LoadStatus.EMPTY : LoadStatus.LOADED);
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
