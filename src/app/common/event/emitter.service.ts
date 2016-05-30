import {Injectable, EventEmitter} from '@angular/core';

import {Events} from './events.enum';

@Injectable()
export class EmitterService {
    private _emitters: { [event: string]: EventEmitter<any> } = {};

    get(event: Events): EventEmitter<any> {
        if (!this._emitters[event])
            this._emitters[event] = new EventEmitter();
        return this._emitters[event];
    }
}
