import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Component, Inject } from "@angular/core";
import { IgeError } from "../../models/ige-error";
import {
  ConfigService,
  Configuration,
} from "../../services/config/config.service";
import { Router } from "@angular/router";

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
    private router: Router
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

  goToCurrentCatalog() {
    location.href = `/${ConfigService.catalogId}/dashboard`;
  }
}
