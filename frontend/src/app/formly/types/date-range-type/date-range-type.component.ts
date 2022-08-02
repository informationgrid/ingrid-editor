import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: "ige-date-range-type",
  templateUrl: "./date-range-type.component.html",
  styleUrls: ["./date-range-type.component.scss"],
})
export class DateRangeTypeComponent extends FieldType implements OnInit {
  rangeFormGroup = new UntypedFormGroup({
    start: new UntypedFormControl(null),
    end: new UntypedFormControl(null),
  });

  ngOnInit(): void {
    this.rangeFormGroup.setValue(
      this.formControl.value ?? { start: null, end: null }
    );

    this.formControl.addValidators([
      (ctrl) => {
        if (this.rangeFormGroup.controls.end.hasError("matEndDateInvalid")) {
          return {
            matEndDateInvalid: {
              message: "Das Enddatum liegt vor dem Startdatum",
            },
          };
        } else return null;
      },
    ]);

    this.formControl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value) => {
        this.rangeFormGroup.setValue(
          value ?? {
            start: null,
            end: null,
          }
        );
      });
  }

  updateFormControl() {
    this.formControl.setValue(this.rangeFormGroup.value);
    this.formControl.markAsTouched();
    this.formControl.markAsDirty();
  }
}
