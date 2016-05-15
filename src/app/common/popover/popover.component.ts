import {Component, provide} from '@angular/core';
import {Confirm, ConfirmOptions, Position} from 'angular2-bootstrap-confirm';
import {PositionService} from 'angular2-bootstrap-confirm/position/position';
// Or if you're already using the ng2-bootstrap module
// import {PositionService} from 'ng2-bootstrap/components/position';

@Component({
  selector: 'popover',
  providers: [ // you can pass both of these when bootstrapping the app to configure globally throughout your app
    ConfirmOptions,
    provide(Position, { // this is required so you can use the bundled position service rather than rely on the `ng2-bootstrap` module
      useClass: PositionService
    })
  ],
  directives: [
    Confirm
  ],
  template: `
    <button
      class="btn btn-danger btn-lg"
      mwl-confirm
      [title]="title"
      [message]="message"
      placement="left"
      (confirm)="confirmClicked = true"
      (cancel)="cancelClicked = true"
      [(isOpen)]="isOpen">
      <i class="fa fa-cutlery" aria-hidden="true"></i> Restaurant
    </button>
  `
})
export class Popover {
  public title: string = 'Popover title';
  public message: string = '<span style="background-color: red;"> Popover</span> <br/><br/><b>description</b>';
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public isOpen: boolean = false;
}
