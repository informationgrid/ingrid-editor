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
import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { FormControl, FormGroup } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { FieldTypeConfig } from "@ngx-formly/core";

@UntilDestroy()
@Component({
  selector: "ige-date-range-type",
  templateUrl: "./date-range-type.component.html",
  styleUrls: ["./date-range-type.component.scss"],
})
export class DateRangeTypeComponent
  extends FieldType<FieldTypeConfig>
  implements OnInit
{
  rangeFormGroup = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  ngOnInit(): void {
    this.rangeFormGroup.setValue(
      this.formControl.value ?? { start: null, end: null },
    );

    this.formControl.addValidators([
      this.validateEnddateAfterStartdate(),
      this.validateIsCompleteRange(),
    ]);

    this.formControl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        this.rangeFormGroup.setValue(
          value ?? {
            start: null,
            end: null,
          },
        );
      });
  }

  private validateIsCompleteRange() {
    const controls = this.rangeFormGroup.controls;
    return () => {
      if (
        (controls.start.value === null && controls.end.value === null) ||
        (controls.start.value !== null && controls.end.value !== null)
      ) {
        return null;
      }

      return {
        startAndEndNeeded: {
          message: "Start- und Enddatum sind Pflicht",
        },
      };
    };
  }

  private validateEnddateAfterStartdate() {
    const controls = this.rangeFormGroup.controls;
    return () => {
      if (controls.end.hasError("matEndDateInvalid")) {
        return {
          matEndDateInvalid: {
            message: "Ende muss hinter dem Start liegen",
          },
        };
      }

      return null;
    };
  }

  updateFormControl() {
    this.formControl.setValue(this.rangeFormGroup.value);
    this.formControl.markAsTouched();
    this.formControl.markAsDirty();
  }
}
