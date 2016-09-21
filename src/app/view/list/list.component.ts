import {Component, ViewEncapsulation} from '@angular/core';
import {Meal, Price} from '../../common/meal';
import {MealSet} from '../../common/meal-set';
import {MealSetComponent} from '../../common/meal-set';
import {MealProviderComponent} from '../../common/meal-provider/meal-provider.component';
import {MealProviderService} from '../../common/meal-provider/meal-provider.service';

@Component({
    selector: 'list-view',
    template: require('./list.html')
})
export class ListView {
    public list: MealSet[] = [];

    constructor(public mealProviderService: MealProviderService) {
    }

    ngOnInit() {

        this.mealProviderService.getDailyMealsByMealSets().subscribe((array) => {
            this.list = array;
        });

        //moch some data
        let meals = new Array<Meal>();
        meals.push(new Meal("Túrós tészta"));
        this.list.push(new MealSet("teszt1", meals, new Price(1455, "HUF"), this.mealProviderService.getCachedMealProviders()[0]));

        let meals2 = new Array<Meal>();
        meals2.push(new Meal("Paradicsom leves"));
        meals2.push(new Meal("Töltött káposzta"));

        this.list.push(new MealSet("teszt2", meals2, new Price(1455, "HUF"), this.mealProviderService.getCachedMealProviders()[1]));

        this.list.push(new MealSet("teszt3", meals, new Price(1455, "HUF"), this.mealProviderService.getCachedMealProviders()[0]));

    }

}
