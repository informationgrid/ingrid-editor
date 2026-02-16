/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { FieldTypeConfig } from "@ngx-formly/core";
import { ReactiveFormsModule } from "@angular/forms";
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from "@angular/material/button-toggle";

export interface ButtonTogglesProps {
  options?: ButtonToggle[];
  // If true, the leading label is hidden but still used as aria-label.
  hideLabel?: boolean;
}

export interface ButtonToggle {
  key: string;
  label: string;
  options: { label: string; value: any }[];
}

@Component({
  selector: "ige-button-toggles-type",
  imports: [ReactiveFormsModule, MatButtonToggleGroup, MatButtonToggle],
  templateUrl: "./button-toggles-type.component.html",
  styleUrl: "./button-toggles-type.component.scss",
})
export class ButtonTogglesTypeComponent
  extends FieldType<FieldTypeConfig<ButtonTogglesProps>>
  implements OnInit
{
  ngOnInit(): void {}

  onToggled(key: string, value: any) {
    let newValue = value;
    if (
      this.formControl?.value &&
      Object.keys(this.formControl.value).includes(key)
    ) {
      // Set value to undefined if the value is the same as the current value.
      if (this.formControl.value[key] === value) newValue = undefined;
    }

    this.formControl?.patchValue({
      ...this.formControl.value,
      ...{ [key]: newValue },
    });
    this.formControl?.markAsDirty();
    this.formControl?.markAsTouched();
  }
}
