import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Rx';

import {Meal} from '../meal';

import {Price} from '../meal/price.model';

import {MealSet} from '../meal-set/meal-set.model';

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
    //TODO remove if meal provider can be added
    this.cacheMealProviders([
      new MealProvider(
        'Bonnie',
        'http://www.bonnierestro.hu',
        {
          phone:'+36307443555'
        },
        'http://www.bonnierestro.hu/hu/napimenu/',
        {'': ''},
        {'': [
          '//div[@id="content"]//h4[text()[contains(.,"09")]]/following-sibling::table[4]//tr[2]/td[3]',
          '//div[@id="content"]//h4[text()[contains(.,"09")]]/following-sibling::table[4]//tr[3]/td[3]',
        ]},
        {'': ''},
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
          phone:'+3612670331'
        },
        'http://www.chictochic.hu/?nav=daily',
        {'1': '//*[@id="content-text"]/table[2]//td[contains(text(),"Csütörtök")]/../following-sibling::tr[1]/td[2]/b'},
        {'1': [
          '//*[@id="content-text"]/table[2]//td[contains(text(),"Csütörtök")]/../following-sibling::tr[1]/td[2]/div'
        ]},
        {'1': '//*[@id="content-text"]/table[2]//td[contains(text(),"Csütörtök")]/../following-sibling::tr[1]/td[3]'},
        {
          lat: 47.4918,
          lng: 19.0541
        },
        'ff5b9c'
      )
    ]);
  }


  public cacheMealProviders(mealProviders:MealProvider[]) {
    localStorage.setItem(KEY_MEAL_PROVIDERS, JSON.stringify(mealProviders));
  }

  public getCachedMealProviders():MealProvider[] {
    var mealProviderString = localStorage.getItem(KEY_MEAL_PROVIDERS);
    if (mealProviderString) {
      try {
        return JSON.parse(mealProviderString);
      }
      catch (e) {
        console.log(e);
      }
    }
    return [];
  }

  private getDailyMealProviders(): Observable<MealProvider> {
    var providersByUrl:{[key:string]:MealProvider} = {};
    var providerXPaths:Observable<XpathResolutionResult>[] = [];

    this.getCachedMealProviders()
    .forEach((provider:MealProvider)=>{
      providersByUrl[provider.dailyMealUrl] = provider;
      var xpaths:string[] = [];
      for (var key in provider.dailyMealQueryXPathByMealSet) {
        xpaths.push(provider.mealSetQueryXPath[key]);
        xpaths = [...xpaths, ...provider.dailyMealQueryXPathByMealSet[key], provider.mealSetPriceQueryXPathByMealSet[key]];
      }
      providerXPaths.push(this.xpathService.resolveXPaths(provider.dailyMealUrl, ...xpaths));
    });

    return Observable.of(providerXPaths)
    .flatMap((providerXPath)=>providerXPath)
    .mergeAll()
    .map((providerXPath:XpathResolutionResult)=>{
      let provider = providersByUrl[providerXPath.url];
      let xpaths = providerXPath.xpathResult;
      let mealSets:MealSet[] = [];

      for (var mealSetKey in provider.mealSetQueryXPath) {
        let meals: Meal[] = [];
        for (var mealXPath of provider.dailyMealQueryXPathByMealSet[mealSetKey]) {
          meals.push(new Meal(xpaths[mealXPath].trim()));
        }
        let price: Price = null;
        if (provider.mealSetPriceQueryXPathByMealSet[mealSetKey]) {
          price = Price.fromString(xpaths[provider.mealSetPriceQueryXPathByMealSet[mealSetKey]]);
        }
        let mealSet: MealSet = new MealSet(xpaths[provider.mealSetQueryXPath[mealSetKey]], meals, price, provider);
        mealSets.push(mealSet);
      }
      provider.mealSets = mealSets;
      provider.distance = this.mapService.calculateDistance(provider.location, this.mapService.getCachedHome().location);
      return provider;
    });
  }

  public getDailyMealsByMealProviders() : Observable<Array<MealProvider>> {
    return this.getDailyMealProviders().reduce((ar:MealProvider[], provider:MealProvider)=>{
      ar.push(provider);
      return ar;
    }, new Array<MealProvider>());

  }

  public getDailyMealsByMealSets() : Observable<Array<MealSet>> {
    return this.getDailyMealProviders().map((provider:MealProvider)=>provider.mealSets).reduce((ar:MealSet[], mealSet:MealSet[])=>{
      ar.push(...mealSet);
      return ar;
    }, new Array<MealSet>());
  }

}
