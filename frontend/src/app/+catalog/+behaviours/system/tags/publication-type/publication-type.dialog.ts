/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface PublicationTypeDialogOptions {
  options: { key: string; value: string }[];
  current: string;
  title: string;
  helpText: string;
}

@Component({
  selector: "ige-publication-type.dialog",
  templateUrl: "./publication-type.dialog.html",
  styleUrls: ["./publication-type.dialog.scss"],
})
export class PublicationTypeDialog {
  options = this.value.options;
  currentValue: any;
  title = "Veröffentlichungsrecht";
  helpText = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) private value: PublicationTypeDialogOptions,
    private dlgRef: MatDialogRef<string>,
  ) {
    this.currentValue =
      value.current
        .split(",")
        .find((item) => this.options.find((option) => option.key === item)) ??
      "internet";
    if (value.title) this.title = value.title;
    if (value.helpText) this.helpText = value.helpText;
  }

  submit() {
    this.dlgRef.close(this.currentValue);
  }
}
