import {Component, ViewEncapsulation} from '@angular/core';

import { NgGrid, NgGridItem } from 'angular2-grid';

@Component({
  selector: 'box-view',
  directives: [NgGrid, NgGridItem],
  template: require('./box.html')
})
export class BoxView {
  constructor() {
     console.log('hello from BoxView');
  }

}
