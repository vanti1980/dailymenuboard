import {Component, Output, EventEmitter} from '@angular/core';


import {DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {XpathTokens} from '../../../common/xpath/xpath-tokens.enum.ts';

@Component({
    selector: 'dmb-xpath-fragment',
    providers: [],
    directives: [DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES],
    template: require('./xpath-fragment.html')
})
export class XpathFragmentComponent {
    @Output() callback = new EventEmitter();

    xpathFragments : Array<string> = XpathTokens.values();

    onClick(event: Event, xpathFragment: string) {
      this.callback.emit(xpathFragment);
    }
}
