import {Component} from '@angular/core';
import {FormArray, FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';

import {GeoCodeResponseJSON, IconType, Location, MapService, Marker, MapComponent} from '../../common/map';

import {EmitterService, Events} from '../../core/event';

@Component({
    selector: 'settings',
    template: require('./settings.html')
})
export class SettingsComponent {

   public marker: Marker;

   constructor(
     private emitterService: EmitterService,
     public mapService:  MapService) {
      this.marker = this.mapService.getCachedHome();
   }

   public onSubmit() {

      this.mapService.getLocation(this.marker.address).subscribe((myLocation) => {
          this.marker.location = myLocation;
          this.mapService.cacheHome(this.marker);
          this.emitterService.get(Events.HOME_CHANGED).emit(undefined);
      });
  }

}
