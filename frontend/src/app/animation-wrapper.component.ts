// see https://stackblitz.com/edit/ngx-formly-animation-zzcq4s
import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import { FieldWrapper, FormlyConfig } from "@ngx-formly/core";
import {
  animate,
  group,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";

@Component({
  selector: "formly-wrapper-animation",
  template: `
    <div [@fadeAnimation]="field.hide ? 'false' : 'true'">
      <ng-container #fieldComponent></ng-container>
    </div>
  `,
  animations: [
    // see: https://github.com/angular/angular/issues/29371
    trigger("fadeAnimation", [
      state(
        "true",
        style({
          height: "*",
          opacity: "1",
        }),
      ),
      state(
        "false",
        style({
          height: "0",
          opacity: "0",
        }),
      ),
      transition("true => false", [
        group([
          animate(
            "200ms ease-in-out",
            style({
              opacity: "0",
            }),
          ),
          animate(
            "200ms ease-in-out",
            style({
              height: "0",
            }),
          ),
        ]),
      ]),
      transition("false => true", [
        group([
          animate(
            "200ms ease-in-out",
            style({
              height: "*",
            }),
          ),
          animate(
            "200ms ease-in-out",
            style({
              opacity: "1",
            }),
          ),
        ]),
      ]),
    ]),
  ],
  // disable hide default behavior
  styles: [
    `
      ::ng-deep formly-field.animated {
        display: block !important;
      }
    `,
  ],
})
export class AnimationWrapperComponent extends FieldWrapper {
  @ViewChild("fieldComponent", { read: ViewContainerRef })
  fieldComponent: ViewContainerRef;
}

export class AnimationWrapper {
  run(fc: FormlyConfig) {
    /*fc.templateManipulators.preWrapper.push((field) =>
      field.props.animation ? "animation" : null
    );*/
  }
}
