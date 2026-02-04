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
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { FieldTypeConfig } from "@ngx-formly/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatButtonToggle, MatButtonToggleGroup } from "@angular/material/button-toggle";
import { skip, take } from "rxjs/operators";

export interface ToggleOption {
  key: string;
  label: string;
  initialValue?: any;
  items?: ToggleItem[];
  hideLabel?: boolean;
}

export interface ToggleItem {
  label: string;
  value: any;
}

@Component({
  selector: "ige-toggles-type",
  imports: [ReactiveFormsModule, MatButtonToggleGroup, MatButtonToggle],
  templateUrl: "./toggles-type.component.html",
  styleUrl: "./toggles-type.component.scss",
})
export class TogglesTypeComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  private destroyRef = inject(DestroyRef);

  tempForm: FormGroup;
  toggles: ToggleOption[];

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.toggles = this.props.options as ToggleOption[];

    // Setup temp form.
    const formDef = {};
    this.props.options.forEach((option) => {
      formDef[option.key] = new FormControl(option.initialValue);
    });
    this.tempForm = new FormGroup(formDef);

    // Used to initialize internal form values from formly form control.
    this.formControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe((value) => {
        this.tempForm.patchValue({ ...value });
      });

    // Sync value changes to the formly form control.
    this.tempForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), skip(1))
      .subscribe((value) => {
        this.formControl?.patchValue(value);
        this.formControl?.markAsDirty();
        this.formControl?.markAsTouched();
      });
  }
}
