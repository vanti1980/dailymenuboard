import {Component, ViewEncapsulation} from '@angular/core';
import {NgForm} from '@angular/common';

import {RouteConfig, Router, ROUTER_DIRECTIVES} from '@angular/router-deprecated';

import {EmitterService} from './common/event';
import {XpathService} from './common/xpath';

import {TranslateService} from 'ng2-translate/ng2-translate';

import {BoxView} from './view/box';
import {ListView} from './view/list';

import {MapService, MapComponent} from './common/map';


import {SettingsComponent} from './view/settings';

@Component({
    selector: 'app',
    pipes: [],
    providers: [XpathService, MapService, EmitterService],
    directives: [ROUTER_DIRECTIVES, SettingsComponent, MapComponent],
    styles: [
        //require('normalize.css')
    ],
    template: require('./app.html')

})
@RouteConfig([
    { path: '*', component: BoxView },
    { path: '/box', name: 'Box', component: BoxView, useAsDefault: true },
    { path: '/list', name: 'List', component: ListView }
])
export class App {

    constructor(public xpathService: XpathService, public router: Router, translate: TranslateService) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);
    }

    ngOnInit() {

    }


    isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }

}
