import {Component, Output, EventEmitter} from '@angular/core';


import {XpathTokens} from '../../../core/xpath/xpath-tokens.enum.ts';

@Component({
    selector: 'dmb-xpath-fragment',
    providers: [],
    template: require('./xpath-fragment.html')
})
export class XpathFragmentComponent {
    @Output() callback = new EventEmitter();

    xpathFragments : Array<string> = XpathTokens.values();

    onClick(event: Event, xpathFragment: string) {
      this.callback.emit(xpathFragment);
    }
}
