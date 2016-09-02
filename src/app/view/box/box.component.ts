import {NgForm} from '@angular/common';
import {Component, ViewEncapsulation, ViewChild} from '@angular/core';
import { NgGrid, NgGridItem, NgGridItemEvent, NgGridConfig } from 'angular2-grid';

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
          this.assignProvidersToBoxes(array);
          // save meal providers with re-aligned positions
          this.mealProviderService.cacheMealProviders(this.mealProviders);
        },
        (err)=>{
          console.log("Error:" + err);
        }
      );
      // this.resetEditedProvider();
    }

    assignProvidersToBoxes(array: MealProvider[]): void {
      this.mealProviders = [];

      // auto-positions are given from an incredibly big value to avoid collision with existing values
      let generatedPosition = this.getPosition(256, 256);
      array.forEach((p)=>p.position !== undefined ? p.position : generatedPosition++);
      array.sort((p1, p2) => p1.position - p2.position);

      // prepare box position map to be matched to that set for meal providers
      let boxPositionMap:{[key:number]:Box} = {};
      let availableBoxPositions:number[] = [];
      let notAssignedMealProviders:MealProvider[] = [];
      this.boxes.forEach((box) => {
        box.mealProvider = undefined;
        const pos = this.getPosition(box.config.row, box.config.col);
        boxPositionMap[pos] = box;
        availableBoxPositions.push(pos);
      });

      // match boxes with meal providers using position...at first try to do full match
      for (let mealProvider of array) {
        let box = boxPositionMap[mealProvider.position];
        if (box) {
          box.mealProvider = mealProvider;
          this.mealProviders.push(mealProvider);
          delete(boxPositionMap[mealProvider.position]);
          availableBoxPositions.splice(availableBoxPositions.indexOf(mealProvider.position), 1);
        }
        else {
          notAssignedMealProviders.push(mealProvider);
        }
      }

      // ...then simply assign the next available value for the ones without matching position
      for (let mealProvider of notAssignedMealProviders) {
        this.mealProviders.push(mealProvider);
        if (availableBoxPositions.length > 0) {
          const position = availableBoxPositions.shift();
          mealProvider.position = position;
          boxPositionMap[position].mealProvider = mealProvider;
        }
        else {
          console.info(`You have reached the maximal number of boxes! Meal provider '${mealProvider.name}' could not be placed.`);
        }
      }
    }

    ngOnChanges(changeRecord) {
        //Called after every change to input properties and before processing content or child views.
        // console.log('ngOnChanges');
    }

    openAddDialog(row: number, col: number) {
      this.resetEditedProvider();
      this.editedProvider.position = this.getPosition(row, col);
      this.addComponent.open();
    }

    openEditDialog(mealProvider: MealProvider) {
      this.editedProvider = mealProvider;
      this.addComponent.open();
    }

    resetEditedProvider(): void {
      this.editedProvider = new MealProvider(undefined, undefined, {}, undefined, [StepMealSetComponent.createMealSetXPath()], undefined, undefined, 0);
    }

    onItemsChanged(items: Array<NgGridItemEvent>) {
      let posChanged = false;
      for (let ix = 0; ix < this.boxes.length; ix++) {
        const box = this.boxes[ix];
        if (box.mealProvider) {
          box.mealProvider.position = this.getPosition((<BoxConfig>box.config).row, (<BoxConfig>box.config).col);
          posChanged = true;
        }
      }
      if (posChanged) {
        this.mealProviderService.cacheMealProviders(this.mealProviders);
      }
    }

    private getPosition(row: number, col: number): number {
        return (col - 1) * 256 + (row - 1);
    }
}
