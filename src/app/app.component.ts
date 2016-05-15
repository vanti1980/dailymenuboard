import {Component, ViewEncapsulation} from '@angular/core';
import {RouteConfig, Router, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {MapService} from './common/map';
import {XpathService} from './common/xpath';

//TODO put back if they confirm pull request for Angular2 RC compatibility
// import {TranslateService} from 'ng2-translate/ng2-translate';

import {BoxView} from './view/box';
import {ListView} from './view/list';

@Component({
    selector: 'app',
    pipes: [],
    providers: [XpathService, MapService],
    directives: [ROUTER_DIRECTIVES],
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

    constructor(public xpathService: XpathService, public router: Router) {
        console.log('constructor App');
    }
    /*
      constructor(translate: TranslateService) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);
      }
    */

    ngOnInit() {

      console.log(this.xpathService);
      console.log('ngOnInit');
    }

    isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }

}
