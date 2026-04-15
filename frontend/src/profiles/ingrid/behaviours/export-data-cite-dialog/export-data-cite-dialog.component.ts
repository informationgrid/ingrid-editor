/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
import { Component, computed, inject, resource, signal } from "@angular/core";
import { DialogTemplateComponent } from "../../../../app/shared/dialog-template/dialog-template.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DataSiteService } from "./data-site.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { FormStateService } from "../../../../app/+form/form-state.service";
import {
  CredentialsDialogComponent,
  CredentialsDialogData,
} from "../../../../app/formly/types/update-get-capabilities/credentials-dialog/credentials-dialog.component";
import { catchError, filter } from "rxjs/operators";
import { from, of, switchMap } from "rxjs";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { JsonViewComponent } from "../../../../app/shared/json-view/json-view.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormErrorComponent } from "../../../../app/+form/form-shared/ige-form-error/form-error.component";

@Component({
  selector: "ige-export-data-cite-dialog",
  imports: [
    DialogTemplateComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatProgressSpinner,
    JsonViewComponent,
    FormErrorComponent,
  ],
  templateUrl: "./export-data-cite-dialog.component.html",
  styleUrl: "./export-data-cite-dialog.component.scss",
})
export class ExportDataCiteDialogComponent {
  dlgRef = inject(MatDialogRef<ExportDataCiteDialogComponent>);
  dataSiteService = inject(DataSiteService);
  formService = inject(FormStateService);
  dialog = inject(MatDialog);
  snackbar = inject(MatSnackBar);

  documentResource = resource({
    params: () => ({
      value: this.formService.getForm().value,
      metadata: this.formService.metadata(),
    }),
    loader: ({ params }) =>
      this.dataSiteService.createDataCite(params.value, params.metadata),
  });
  document = computed(() => this.documentResource.value());

  doiExistsResource = resource({
    params: () => ({
      doi: this.formService.getForm().value.publication.doi,
    }),
    loader: ({ params }) => this.dataSiteService.doiExists(params.doi),
  });
  protected readonly error = signal<string | null>(null);

  submit() {
    this.error.set(null);
    this.dialog
      .open(CredentialsDialogComponent, {
        width: "300px",
        data: {
          message:
            "Bitte geben Sie Ihre Anmeldedaten ein, um die DOI hochzuladen",
        } as CredentialsDialogData,
      })
      .afterClosed()
      .pipe(
        filter((result) => result),
        switchMap((result) =>
          from(
            this.dataSiteService.uploadDOI(
              result.username,
              result.password,
              this.document(),
            ),
          ),
        ),
        catchError((error) => {
          this.error.set(this.translateError(error));

          console.error(
            "Error uploading DOI: " + error.message,
            error.stack ?? error,
          );
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (response === null) return;
        this.snackbar.open("DOI erfolgreich hochgeladen.");
        this.dlgRef.close(true);
      });
  }

  private translateError(error: any) {
    if (error instanceof Response) {
      if (error.status === 401) {
        return "Ungültige Zugangsdaten";
      } else if (error.status === 403) {
        return "Keine Berechtigung zum Hochladen der DOI";
      }
      return "DOI konnte nicht hochgeladen werden. Bitte prüfen Sie Ihre Zugangsdaten!";
    }
    return "DOI konnte nicht hochgeladen werden: " + error.message;
  }
}
