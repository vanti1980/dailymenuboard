import {Component, ViewEncapsulation} from '@angular/core';
import {RouteConfig, Router, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {MealProviderDetailService} from './meal-provider-detail';

//TODO put back if they confirm pull request for Angular2 RC compatibility
// import {TranslateService} from 'ng2-translate/ng2-translate';


@Component({
    selector: 'app',
    pipes: [],
    providers: [MealProviderDetailService],
    directives: [ROUTER_DIRECTIVES],
    styles: [
        require('normalize.css')
    ],
    template: require('./app.html')
})
@RouteConfig([
])
export class App {

    constructor(public mealProviderDetail: MealProviderDetailService) {
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

      console.log("lllllllllllddddddd");
      console.log(this.mealProviderDetail);
      this.mealProviderDetail.resolveXPath('aaaa', 'bbbbb');

    }

}
