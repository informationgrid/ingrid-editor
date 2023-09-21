import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";

@Component({
  selector: "ige-section-wrapper",
  template: `
    <h2 role="heading" *ngIf="props.label">{{ props.label }}</h2>
    <ng-container #fieldComponent></ng-container>

    <mat-divider aria-hidden="true"></mat-divider>
  `,
  styleUrls: ["./section-wrapper.component.scss"],
})
export class SectionWrapper extends FieldWrapper {
  @ViewChild("fieldComponent", { read: ViewContainerRef, static: true })
  fieldComponent: ViewContainerRef;
}
