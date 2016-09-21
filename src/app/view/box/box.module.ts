import { NgModule }           from '@angular/core';
import { CommonModule as Ng2CommonModule }       from '@angular/common';

import { NgGridModule } from 'angular2-grid';
import { DropdownModule, TooltipModule} from 'ng2-bootstrap/ng2-bootstrap';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

import { CoreModule }         from '../../core/core.module';
import { CommonModule }         from '../../common/common.module';

import { BoxView }   from './box.component';
import { AddModule }   from '../add/add.module';
import { SettingsModule }   from '../settings/settings.module';

@NgModule({
  imports: [
    Ng2CommonModule,
    CoreModule,
    NgGridModule,
    DropdownModule,
    CommonModule,
    TooltipModule,
    AddModule,
    SettingsModule,
    Ng2Bs3ModalModule
  ],
  declarations: [ BoxView ],
  exports:      [ BoxView ],
  providers:    [ ]
})
export class BoxModule { }
