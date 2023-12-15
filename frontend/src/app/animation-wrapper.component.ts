/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
