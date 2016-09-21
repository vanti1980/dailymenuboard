import { NgModule }           from '@angular/core';
import { CommonModule as Ng2CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';

import { DropdownModule, TooltipModule} from 'ng2-bootstrap/ng2-bootstrap';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

import { CoreModule }         from '../../core/core.module';
import { CommonModule }         from '../../common/common.module';

import { SettingsComponent }   from './settings.component';

@NgModule({
  imports:      [ Ng2CommonModule, FormsModule, CoreModule, DropdownModule, CommonModule, TooltipModule, Ng2Bs3ModalModule ],
  declarations: [ SettingsComponent ],
  exports:      [ SettingsComponent ],
  providers:    [ ]
})
export class SettingsModule { }
