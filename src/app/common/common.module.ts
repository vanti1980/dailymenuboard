import { NgModule }           from '@angular/core';
import { CommonModule as Ng2CommonModule }      from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { AgmCoreModule } from 'angular2-google-maps/ts/core';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

import { CoreModule }         from '../core/core.module';
import { ConfirmComponent }   from './confirm';
import {
  MapComponent,
  MapService }                from './map';
import { MealComponent }      from './meal';
import {
  MealProviderComponent,
  MealProviderService }       from './meal-provider';
import { MealSetComponent }   from './meal-set';
import { DebounceInputControlValueAccessor } from './util';

@NgModule({
  imports:      [ Ng2CommonModule, FormsModule, CoreModule, Ng2Bs3ModalModule, AgmCoreModule.forRoot() ],
  declarations: [ ConfirmComponent, MapComponent, MealProviderComponent, MealSetComponent, MealComponent, DebounceInputControlValueAccessor ],
  exports:      [ ConfirmComponent, MapComponent, DebounceInputControlValueAccessor, MealProviderComponent, MealSetComponent, MealComponent ],
  providers:    [ MapService, MealProviderService ]
})
export class CommonModule { }
