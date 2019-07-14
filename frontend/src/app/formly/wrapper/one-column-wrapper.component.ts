// panel-wrapper.component.ts
import {Component, ElementRef, ViewChild, ViewContainerRef} from '@angular/core';
import {FieldWrapper} from '@ngx-formly/core';
import {ContextHelpComponent} from '../../+demo-layout/form/context-help/context-help.component';
import {MatDialog} from '@angular/material';
import {Overlay} from '@angular/cdk/overlay';

@Component({
  selector: 'ige-one-column-wrapper',
  template: `
    <div fxLayout="row">
      <label (click)="showContextHelp($event)">{{ to.externalLabel }} <span *ngIf="to.required">*</span></label>
      <div class="flex-1">
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
    {{model | json}}
  `,
  styles: [`

      /*:host {
    padding: 20px;
    display: block;
  }*/

      /deep/ .form-content .mat-form-field-infix {
          /*border-top: 0.2em solid transparent;*/
          border-top: 0;
      }

      /deep/ .form-content .mat-form-field-appearance-outline .mat-form-field-infix {
          padding: 1em 0 0.7em 0;
      }

      /deep/ .form-content .mat-form-field-appearance-outline .mat-form-field-subscript-wrapper {
          padding: 0.2em 1em;
      }

      /deep/ .form-content .mat-form-field-wrapper {
          padding-bottom: 0.3em;
      }

      /deep/ .form-content .mat-form-field-invalid .mat-form-field-wrapper {
          padding-bottom: 0;
          margin: 0.25em 0 0 0;
      }

      /deep/ .form-content .mat-form-field-subscript-wrapper {
          padding-top: 3px;
      }

      /deep/ .form-content .mat-form-field-label-wrapper {
          top: -0.64375em;
      }

      /deep/ .form-content .mat-form-field-appearance-outline.mat-form-field-can-float.mat-form-field-should-float .mat-form-field-label {
          -webkit-transform: translateY(-1.09375em) scale(.75);
          transform: translateY(-1.09375em) scale(.75);
      }

      /deep/ .form-content .mat-select-arrow-wrapper {
          padding-top: 10px;
      }

      /deep/ .mat-button-wrapper {
          vertical-align: middle;
      }

      /* Multi-line error: https://github.com/angular/material2/issues/4580#issuecomment-340692923 */
      /deep/ mat-form-field .mat-form-field-underline {
          position: static;
      }

      /deep/ mat-form-field .mat-form-field-subscript-wrapper {
          position: static;
          margin-top: 0.4em;
      }

      /deep/ mat-form-field.mat-form-field-invalid .mat-form-field-subscript-wrapper {
          margin-top: 0;
      }

      /*-------------------*/

      .section {
          color: #196ea2;
      }

      .section mat-icon {
          vertical-align: bottom;
      }

      .separator {
          padding: 15px 0;
      }

      .header {
          background-color: #f3f3f3;
          padding-top: 15px;
          padding-bottom: 15px;
      }

      .header h1 {
          margin-bottom: 15px;
          padding-left: 20px;
          color: #196ea2;
      }

      .header div, .form-content {
          padding-left: 20px;
          padding-right: 20px;
      }

      .form-content {
          min-width: 400px;
          max-width: 1200px;
          width: 100%;
          padding-top: 15px;
          padding-left: 40px;
      }

      .example-margin {
          margin: 0 40px 0 0;
      }

      .anchor-navigation {
          text-align: center;
      }

      div label {
          min-width: 350px;
          padding-top: 17px;
      }

      .checkbox-row {
          padding-bottom: 25px;
      }

      .checkbox-row-label {
          padding-top: 2px !important;
      }

  `]
})
export class OneColumnWrapperComponent extends FieldWrapper {
  @ViewChild('fieldComponent', {read: ViewContainerRef}) fieldComponent: ViewContainerRef;

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
