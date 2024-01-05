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
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";
import { IgeError } from "../../models/ige-error";
import { ConfigService } from "../../services/config/config.service";

@Component({
  selector: "error-dialog",
  templateUrl: "error-dialog.component.html",
  styleUrls: ["error-dialog.component.scss"],
})
export class ErrorDialogComponent {
  errors: IgeError[];
  generalErrorMessage = "Entschuldigung, etwas ist schiefgegangen!";
  public supportEmail: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) data: IgeError | IgeError[],
    private dlgRef: MatDialogRef<ErrorDialogComponent>,
    configService: ConfigService,
  ) {
    this.supportEmail = configService.getConfiguration()?.supportEmail;
    if (data instanceof Array) {
      this.errors = data;
    } else {
      this.errors = [data];
    }
  }

  close() {
    this.dlgRef.close();
  }
}
