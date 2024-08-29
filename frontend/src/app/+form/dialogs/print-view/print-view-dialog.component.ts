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
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { FormlyFormOptions, FormlyModule } from "@ngx-formly/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { AngularSplitModule } from "angular-split";
import { MatButtonModule } from "@angular/material/button";
import { DialogTemplateModule } from "../../../shared/dialog-template/dialog-template.module";

@Component({
  templateUrl: "print-view-dialog.component.html",
  styles: [
    `
      mat-button-toggle-group {
        font-size: 14px;
        border: none;
      }
      .preview-print {
        max-width: min(950px, 90vw);
        margin: auto !important;
      }
    `,
  ],
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonToggleModule,
    FormlyModule,
    AngularSplitModule,
    MatButtonModule,
    DialogTemplateModule,
  ],
  standalone: true,
})
export class PrintViewDialogComponent {
  profile: any;
  form = new UntypedFormGroup({});
  options: FormlyFormOptions = {};
  formCompare = new UntypedFormGroup({});
  compareView = false;

  constructor(
    public dialogRef: MatDialogRef<PrintViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.options.formState = {
      disabled: true,
      mainModel: data.model,
    };
  }

  print() {
    window.print();
  }
}
