import {NgForm} from '@angular/common';
import {Component, ViewEncapsulation, ViewChild} from '@angular/core';
import { NgGrid, NgGridItem, NgGridConfig } from 'angular2-grid';

import {Observable} from 'rxjs/Rx';

import {EmitterService, Events} from '../../common/event';
import {MealProviderComponent, MealProvider, MealProviderService} from '../../common/meal-provider';
import {MapComponent} from '../../common/map';
import {Box}        from './box.model';
import {BoxConfig} from './box.config';

import {AddComponent} from '../add/add.component';
import {StepMealSetComponent} from '../add/step-mealset';

@Component({
    selector: 'box-view',
    providers: [MealProviderService],
    directives: [NgGrid, NgGridItem, MealProviderComponent, MapComponent, AddComponent],
    template: require('./box.html')
})
export class BoxView {

    public boxes: Box[];
    public mealProviders: MealProvider[] = [];
    public editedProvider: MealProvider;
    public maxNumberOfColumn: number;

    private eventSubscriptions: {[key: number]:any} = {};

    @ViewChild(AddComponent)
    private addComponent: AddComponent;

    constructor(
      private emitterService: EmitterService,
      public mealProviderService: MealProviderService) {

        this.maxNumberOfColumn = 4;

        this.boxes = [
            new Box(new BoxConfig(1, 1)),
            new Box(new BoxConfig(1, 2)),
            new Box(new BoxConfig(4, 1)),
            new Box(new BoxConfig(4, 2))
        ];
        this.resetEditedProvider();
    }

    ngOnInit() {
      this.initMealProviders();
      this.eventSubscriptions[Events.MEAL_PROVIDER_ADDED] = this.emitterService.get(Events.MEAL_PROVIDER_ADDED).subscribe(msg =>{
        this.initMealProviders();
      });
      this.eventSubscriptions[Events.MEAL_PROVIDER_EDITED] = this.emitterService.get(Events.MEAL_PROVIDER_EDITED).subscribe(provider =>{
        this.openEditDialog(provider);
      });
      this.eventSubscriptions[Events.MEAL_PROVIDER_REMOVED] = this.emitterService.get(Events.MEAL_PROVIDER_REMOVED).subscribe(msg =>{
        this.initMealProviders();
      });
      this.eventSubscriptions[Events.MEAL_PROVIDER_UPDATED] = this.emitterService.get(Events.MEAL_PROVIDER_UPDATED).subscribe(msg =>{
        this.initMealProviders();
      });
      this.eventSubscriptions[Events.MEAL_PROVIDER_DISCARDED] = this.emitterService.get(Events.MEAL_PROVIDER_DISCARDED).subscribe(msg =>{
        // this.resetEditedProvider();
      });
    }

    ngOnDestroy() {
      this.eventSubscriptions[Events.MEAL_PROVIDER_ADDED].unsubscribe();
      this.eventSubscriptions[Events.MEAL_PROVIDER_EDITED].unsubscribe();
      this.eventSubscriptions[Events.MEAL_PROVIDER_REMOVED].unsubscribe();
      this.eventSubscriptions[Events.MEAL_PROVIDER_UPDATED].unsubscribe();
      this.eventSubscriptions[Events.MEAL_PROVIDER_DISCARDED].unsubscribe();
    }

    private initMealProviders():void {
        var mealProviders: Observable<MealProvider[]> = this.mealProviderService.getDailyMealsByMealProviders();
        mealProviders.subscribe((array) => {
          this.mealProviders = [];
          let mealProviderIx = 0;
          for (let boxIx = 0; boxIx < this.boxes.length; boxIx++,mealProviderIx++) {
            let provider: MealProvider = array[mealProviderIx];
            this.mealProviders.push(provider);
            if (array.length > boxIx) {
              this.boxes[boxIx].mealProvider = array[mealProviderIx];
            }
            else {
              this.boxes[boxIx].mealProvider = undefined;
            }
          }

          if (this.boxes.length < array.length) {
              console.error('You have reached the maximal number of boxes! We can show in this version of the application only ' + this.boxes.length + ' boxes');
          }
        },
        (err)=>{
          console.log("Error:" + err);
        }
      );
      // this.resetEditedProvider();
    }

    ngOnChanges(changeRecord) {
        //Called after every change to input properties and before processing content or child views.
        // console.log('ngOnChanges');
    }

    openAddDialog() {
      this.resetEditedProvider();
      this.addComponent.open();
    }

    openEditDialog(mealProvider: MealProvider) {
      this.editedProvider = mealProvider;
      this.addComponent.open();
    }

    resetEditedProvider(): void {
      this.editedProvider = new MealProvider(null, null, {}, null, [StepMealSetComponent.createMealSetXPath()], null, null);
    }
}
