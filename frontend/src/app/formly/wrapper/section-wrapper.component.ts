/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { FieldWrapper } from "@ngx-formly/core";
import { MatDivider } from "@angular/material/divider";

@Component({
  selector: "ige-section-wrapper",
  template: `
    @if (props.label) {
      <h2 role="heading">{{ props.label }}</h2>
    }
    <ng-container #fieldComponent></ng-container>

    <mat-divider aria-hidden="true"></mat-divider>
  `,
  styleUrls: ["./section-wrapper.component.scss"],
  imports: [MatDivider],
  standalone: true,
})
export class SectionWrapper extends FieldWrapper {
  @ViewChild("fieldComponent", { read: ViewContainerRef, static: true })
  fieldComponent: ViewContainerRef;
}
