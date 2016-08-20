import {Serializable} from '../util';

export class Color extends Serializable{


    constructor(
        public value: string
    ) {
      super();
    };

    getValueWithoutHash(): string {
        let cleaned = this.value;
        if (this.value.startsWith('#')) {
            cleaned = this.value.substr(1, this.value.length);
        }
        return cleaned;
    };
}
