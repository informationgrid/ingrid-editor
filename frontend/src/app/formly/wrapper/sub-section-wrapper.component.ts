/*
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { FieldWrapper, FormlyValidationMessage } from "@ngx-formly/core";
import { MatDivider } from "@angular/material/divider";
import { FormErrorComponent } from "../../+form/form-shared/ige-form-error/form-error.component";

@Component({
  selector: "ige-sub-section-wrapper",
  template: `
    @if (!props.hideDivider) {
      <mat-divider aria-hidden="true"></mat-divider>
    }
    @if (props.label) {
      <h4 role="heading">{{ props.label }}</h4>
    }
    @if (showError && props.hasValidation && field.form.invalid) {
      <ige-form-error>
        <formly-validation-message [field]="field"></formly-validation-message>
      </ige-form-error>
    }
    <ng-container #fieldComponent></ng-container>
  `,
  styleUrls: ["./sub-section-wrapper.component.scss"],
  imports: [MatDivider, FormErrorComponent, FormlyValidationMessage],
})
export class SubSectionWrapper extends FieldWrapper {
  @ViewChild("fieldComponent", { read: ViewContainerRef, static: true })
  fieldComponent: ViewContainerRef;
}
