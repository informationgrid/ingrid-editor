import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { DialogTemplateModule } from "../../../app/shared/dialog-template/dialog-template.module";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { NgForOf } from "@angular/common";
import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { geometryContextFields } from "./geometry-context.fields";

@UntilDestroy()
@Component({
  templateUrl: "./geometry-context-dialog.component.html",
  imports: [
    DialogTemplateModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    NgForOf,
    FormlyModule,
  ],
  standalone: true,
})
export class GeometryContextDialogComponent implements OnInit {
  form: FormGroup = new FormGroup<any>({});

  static featureTypeOptions = [
    { label: "nominal", value: "nominal" },
    { label: "ordinal", value: "ordinal" },
    { label: "skalar", value: "scalar" },
    { label: "sonstiges", value: "other" },
  ];

  disabled: boolean;

  fields: FormlyFieldConfig[] = geometryContextFields();

  constructor(
    private dlgRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    this.form.statusChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      setTimeout(() => {
        if (value === "VALID") this.disabled = false;
        else if (value === "INVALID") this.disabled = true;
      });
    });
  }

  submit() {
    this.dlgRef.close(this.form.value);
  }
}
