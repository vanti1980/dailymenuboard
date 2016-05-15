import {Component, ViewEncapsulation} from '@angular/core';

import {Popover} from '../../common/popover';

@Component({
  selector: 'list-view',
  template: require('./list.html'),
  directives: [Popover]
})
export class ListView {
  constructor() {

  }

}
