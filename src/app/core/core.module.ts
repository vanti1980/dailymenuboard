import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { Http, HttpModule } from '@angular/http';

import {TranslateLoader, TranslateStaticLoader, TranslateModule } from 'ng2-translate';

import { EmitterService }   from './event';
import { XpathService } from './xpath';

@NgModule({
  imports:      [
    CommonModule,
    HttpModule,
    TranslateModule.forRoot({
        provide: TranslateLoader,
        useFactory: (http: Http) => new TranslateStaticLoader(http, '/assets/i18n', '.json'),
        deps: [Http]
      }),
 ],
  declarations: [ ],
  exports:      [ TranslateModule ],
  providers:    [ EmitterService, XpathService ]
})
export class CoreModule { }
