// panel-wrapper.component.ts
import {Component, ElementRef, ViewChild, ViewContainerRef} from '@angular/core';
import {FieldWrapper} from '@ngx-formly/core';
import {ContextHelpComponent} from '../../+demo-layout/form/context-help/context-help.component';
import {MatDialog} from '@angular/material/dialog';
import {Overlay} from '@angular/cdk/overlay';

@Component({
  selector: 'ige-one-column-wrapper',
  template: `
    <div fxLayout="row">
      <div class="label-wrapper">
        <label (click)="showContextHelp($event)">{{ to.externalLabel }} <span *ngIf="to.required">*</span></label>
      </div>
      <ng-container #fieldComponent></ng-container>
    </div>
  `,
  styleUrls: ['./one-column-wrapper.component.scss']
})
export class OneColumnWrapperComponent extends FieldWrapper {
  @ViewChild('fieldComponent', {read: ViewContainerRef, static: true}) fieldComponent: ViewContainerRef;

  constructor(public dialog: MatDialog, private overlay: Overlay) {
    super();
  }

  showContextHelp(evt: MouseEvent) {

    const target = new ElementRef(evt.currentTarget);
    this.overlay.position().flexibleConnectedTo(target).positionChanges.subscribe(posChange => {
      console.log('Position changed', posChange);
    });
    const dialogRef = this.dialog.open(ContextHelpComponent, {
      hasBackdrop: false,
      closeOnNavigation: true,

      // data: { dialogRef: dialogRef }
      position: {
        // @ts-ignore
        left: `${target.nativeElement.getBoundingClientRect().left}px`,
        // @ts-ignore
        top: `${target.nativeElement.getBoundingClientRect().top}px`
      },
      /*scrollStrategy: this.overlay.scrollStrategies.reposition({
        autoClose: true
      }),*/
      // height: '400px',
      width: '330px'
    });
  }

}
