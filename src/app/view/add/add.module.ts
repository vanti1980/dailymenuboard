import { NgModule }           from '@angular/core';
import { CommonModule as Ng2CommonModule }       from '@angular/common';
import { ReactiveFormsModule }        from '@angular/forms';

import { DropdownModule, TooltipModule} from 'ng2-bootstrap/ng2-bootstrap';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

import { CoreModule }         from '../../core/core.module';
import { CommonModule }         from '../../common/common.module';

import { AddComponent }   from './add.component';
import { StepMainComponent }   from './step-main/step-main.component';
import { StepMealSetComponent }   from './step-mealset/step-mealset.component';
import { XpathFragmentComponent }   from './xpath-fragment/xpath-fragment.component';

@NgModule({
  imports:      [ Ng2CommonModule, ReactiveFormsModule, CoreModule, DropdownModule, CommonModule, TooltipModule, Ng2Bs3ModalModule ],
  declarations: [ AddComponent, StepMainComponent, StepMealSetComponent, XpathFragmentComponent ],
  exports:      [ AddComponent ],
  providers:    [ ]
})
export class AddModule { }
