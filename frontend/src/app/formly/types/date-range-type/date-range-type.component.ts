import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/material";
import { UntilDestroy } from "@ngneat/until-destroy";
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
  ngOnInit(): void {
    this.formControl.addValidators([
      (ctrl) => {
        if (
          this.field.fieldGroup[1].formControl.hasError("matEndDateInvalid") ||
          this.field.fieldGroup[0].formControl.hasError("matStartDateInvalid")
        ) {
          return {
            matEndDateInvalid: {
              message: "Das Enddatum liegt vor dem Startdatum",
            },
          };
        } else return null;
      },
    ]);
  }
}
