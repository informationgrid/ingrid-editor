/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
import { Component, OnInit, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FieldType } from "@ngx-formly/material/form-field";
import { FieldTypeConfig } from "@ngx-formly/core";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from "@angular/material/datepicker";
import { MatInput } from "@angular/material/input";
import { MatFormField, MatSuffix } from "@angular/material/form-field";
import { MatDivider } from "@angular/material/divider";
import {
  MatTimepicker,
  MatTimepickerInput,
  MatTimepickerToggle,
} from "@angular/material/timepicker";

@Component({
  selector: "ige-time-reference-input",
  imports: [
    ReactiveFormsModule,
    MatRadioGroup,
    MatRadioButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormField,
    MatInput,
    MatSuffix,
    MatDivider,
    MatTimepicker,
    MatTimepickerToggle,
    MatTimepickerInput,
  ],
  templateUrl: "./time-reference.component.html",
  styleUrl: "./time-reference.component.scss",
})
export class TimeReferenceComponent
  extends FieldType<FieldTypeConfig<any>>
  implements OnInit
{
  showTimepicker = signal<boolean>(false);

  ngOnInit(): void {
    if (this.props.showTimepicker) this.showTimepicker.set(true);
  }
}
