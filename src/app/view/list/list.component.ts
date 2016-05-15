import {Component, ViewEncapsulation} from '@angular/core';
import {MealSet} from '../../common/meal-set';
import {MealSetComponent} from '../../common/meal-set';
import {MealProviderService} from '../../common/meal-provider/meal-provider.service';
import {Popover} from '../../common/popover';

@Component({
    selector: 'list-view',
    template: require('./list.html'),
    directives: [Popover, MealSetComponent]
})
export class ListView {
    public list: MealSet[] = [];

    constructor(public mealProviderService: MealProviderService) {
        console.log('hello from ListView');
    }

    ngOnInit() {
        console.log('ngOnInit');
        //this.mealProviderService.ngOnInit();

        this.mealProviderService.getDailyMealsByMealSets().subscribe((array) => {
            this.list = array;
        });

    }

}
