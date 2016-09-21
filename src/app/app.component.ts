import {Component, ViewEncapsulation} from '@angular/core';

import {EmitterService} from './core/event';
import {XpathService} from './core/xpath';

import {TranslateService} from 'ng2-translate/ng2-translate';

import {BoxView} from './view/box';
import {ListView} from './view/list';

import {MapService, MapComponent} from './common/map';


import {SettingsComponent} from './view/settings';

@Component({
    selector: 'app',
    styles: [
        //require('normalize.css')
    ],
    template: require('./app.html')

})
export class App {

    constructor(public xpathService: XpathService, translate: TranslateService) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);
    }

    ngOnInit() {

    }
}
