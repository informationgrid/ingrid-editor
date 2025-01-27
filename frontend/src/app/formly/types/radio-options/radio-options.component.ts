/**
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
import { Component, OnInit } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { FieldTypeConfig } from "@ngx-formly/core";
import { FieldType } from "@ngx-formly/material";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio";

interface RadioOption {
  title: string;
  key: string;
}

@UntilDestroy()
@Component({
  selector: "ige-radio-options",
  imports: [CommonModule, MatRadioGroup, MatRadioButton, FormsModule],
  templateUrl: "./radio-options.component.html",
  styleUrl: "./radio-options.component.scss",
})
export class RadioOptionsComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  radioOptions: RadioOption[];
  selectedValue: string = null;

  ngOnInit() {
    this.radioOptions = this.props.radioOptions;
    if (!this.formControl.value && this.radioOptions?.length > 0) {
      this.formControl.setValue(this.radioOptions[0].key);
    }
    this.selectedValue = this.formControl.value;
  }
  selectOption(option: RadioOption) {
    this.formControl.setValue(option.key);
  }
}
