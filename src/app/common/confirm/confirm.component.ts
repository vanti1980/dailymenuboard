import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
    selector: 'confirm',
    template: require('./confirm.html')
})
export class ConfirmComponent {

    @Input() msg: string;
    @Input() data: any;
    @Output() onClose = new EventEmitter();
    @Output() onDismiss = new EventEmitter();

    @ViewChild(ModalComponent)
    private modalComponent: ModalComponent;


    constructor() {
    }

    onNo() {
        this.modalComponent.dismiss();
    }

    onYes() {
        this.modalComponent.close();
    }

    onConfirmClose() {
        this.onClose.emit(this.data);
    }

    onConfirmDismiss() {
        this.onDismiss.emit(this.data);
    }

    public open(data: any): void {
        this.data = data;
        this.modalComponent.open();
    }
}
