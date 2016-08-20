import {Color} from '../color';

import {Location} from './location.model';

import {Serializable} from '../util';

export class Marker extends Serializable {
    constructor(

        public name: string,
        public address: string,
        public location: Location,
        public color: Color
    ) { super(); }
}
