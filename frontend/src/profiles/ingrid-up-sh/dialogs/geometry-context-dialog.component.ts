import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UntilDestroy } from "@ngneat/until-destroy";
import { DialogTemplateModule } from "../../../app/shared/dialog-template/dialog-template.module";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { NgForOf } from "@angular/common";
import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { FormFieldHelper } from "../../form-field-helper";

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

  getFeatureTypes = GeometryContextDialogComponent.featureTypeOptions;

  fieldHelper = new FormFieldHelper();

  fields: FormlyFieldConfig[] = [
    this.fieldHelper.addInputInline("geometryType", "Geometrie-Typ", {
      required: true,
    }),
    this.fieldHelper.addInputInline("name", "Name", {
      required: true,
    }),
    this.fieldHelper.addSelectInline("featureType", "Feature-Typ", {
      required: true,
      options: this.getFeatureTypes,
    }),
    this.fieldHelper.addInputInline("dataType", "Daten-Typ/-Klasse", {
      required: true,
    }),
    this.fieldHelper.addInputInline("description", "Beschreibung", {
      required: true,
    }),
    this.fieldHelper.addGroupSimple(
      null,
      [
        this.fieldHelper.addInputInline("min", "Min", {
          type: "number",
          className: "flex-1",
        }),
        this.fieldHelper.addInputInline("max", "Max", {
          type: "number",
          className: "flex-1",
        }),
      ],
      {
        fieldGroupClassName: "flex-row gap-12",
        hideExpression:
          "model.featureType.key === 'nominal' || model.featureType.key === 'other'",
      },
    ),
    this.fieldHelper.addInputInline("unit", "Einheit", {
      required: true,
      expressions: {
        hide: "model.featureType.key !== 'scalar'",
      },
    }),
  ];

  constructor(
    private dlgRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {}

  submit() {
    this.dlgRef.close(this.form.value);
  }
}
