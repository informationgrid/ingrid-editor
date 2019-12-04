import {Component, ViewChild, ViewContainerRef} from '@angular/core';
import {FieldWrapper} from '@ngx-formly/core';

@Component({
  selector: 'ige-section-wrapper',
  template: `
    <h3><mat-icon inline>format_line_spacing</mat-icon> {{to.label}}</h3>
    <ng-container #fieldComponent></ng-container>

    <mat-divider></mat-divider>
  `,
  styleUrls: ['./section-wrapper.component.scss']
})
export class SectionWrapper extends FieldWrapper {

  @ViewChild('fieldComponent', {read: ViewContainerRef, static: true}) fieldComponent: ViewContainerRef;

}
