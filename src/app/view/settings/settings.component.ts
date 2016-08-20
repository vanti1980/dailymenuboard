import {NgForm, ControlArray, ControlGroup, Control, FormBuilder, Validators} from '@angular/common';
import {Component} from '@angular/core';

import {MapService, MapComponent} from '../../common/map';

import {GeoCodeResponse, IconType} from '../../common/map';

import {Marker} from '../../common/map';

import {Location} from '../../common/map';
import {Color} from '../../common/color';

import {ColorPickerDirective} from 'angular2-color-picker';

@Component({
    selector: 'settings',
    providers: [MapService],
    directives: [MapComponent, ColorPickerDirective],
    template: require('./settings.html')
})
export class SettingsComponent {

   public marker: Marker;

   constructor(public mapService:  MapService){
      this.marker = this.mapService.getCachedHome();
   }
   public onSubmit() {

      this.mapService.getLocation(this.marker.address).subscribe((myLocation) => {
          this.marker.location = myLocation;
          this.mapService.cacheHome(this.marker);
      });

        //this.mapComponent.ngOnInit()
  }

}
