import {Component, ViewEncapsulation} from '@angular/core';
import {NgForm} from '@angular/common';

import {RouteConfig, Router, ROUTER_DIRECTIVES} from '@angular/router-deprecated';
import {MapService, MapComponent} from './common/map';
import {XpathService} from './common/xpath';

import {TranslateService} from 'ng2-translate/ng2-translate';

import {BoxView} from './view/box';
import {ListView} from './view/list';

import {GeoCodeResponse, Location, Marker, IconType} from './common/map/map.model.ts';

@Component({
    selector: 'app',
    pipes: [],
    providers: [XpathService, MapService, MapComponent],
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

   public marker: Marker;

    constructor(public xpathService: XpathService, public router: Router, translate: TranslateService, public mapService:  MapService, public mapComponent: MapComponent) {
        var userLang = navigator.language.split('-')[0];
        translate.setDefaultLang('en');
        translate.use(userLang);
        this.marker = this.mapService.getCachedHome();
    }

    ngOnInit() {

    }

    public onSubmit() {

        console.log(JSON.stringify(this.marker));
        this.mapService.getLocation(this.marker.address).subscribe((myLocation) => {
           this.marker.location = myLocation;
           this.mapService.cacheHome(this.marker);
        });

         this.mapComponent.ngOnInit()

   }

    isActive(instruction: any[]): boolean {
        return this.router.isRouteActive(this.router.generate(instruction));
    }



}
