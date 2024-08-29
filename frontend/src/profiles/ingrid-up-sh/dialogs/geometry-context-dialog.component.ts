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
import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";

import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { geometryContextFields } from "./geometry-context.fields";

@UntilDestroy()
@Component({
  templateUrl: "./geometry-context-dialog.component.html",
  imports: [
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
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
