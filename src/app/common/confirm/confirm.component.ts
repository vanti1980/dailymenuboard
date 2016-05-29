import {NgForm, ControlArray, ControlGroup, Control, FormBuilder, Validators, NgClass} from '@angular/common';
import {Component,ViewChild, Input, Output,EventEmitter} from '@angular/core';
import {ModalComponent,MODAL_DIRECTIVES } from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
    selector: 'confirm',
    providers: [],
    directives: [NgClass, MODAL_DIRECTIVES],
    template: require('./confirm.html')
})
export class ConfirmComponent {

    @Input() msg:string;
    @Input() data:any;
    @Output() onClose = new EventEmitter();
    @Output() onDismiss = new EventEmitter();

    @ViewChild(ModalComponent)
    private modalComponent: ModalComponent;


    constructor() {
    }

    onConfirmClose() {
        this.onClose.emit("onClose");
    }

    onConfirmDismiss() {
        this.onDismiss.emit("onDismiss");
    }

    public open(data:any):void {
      this.data = data;
      this.modalComponent.open();
    }
}
