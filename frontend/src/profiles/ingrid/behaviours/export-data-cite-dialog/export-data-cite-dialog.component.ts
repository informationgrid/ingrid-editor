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
import { of, switchMap } from "rxjs";
import { rxResource } from "@angular/core/rxjs-interop";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { JsonViewComponent } from "../../../../app/shared/json-view/json-view.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormErrorComponent } from "../../../../app/+form/form-shared/ige-form-error/form-error.component";
import { HttpErrorResponse } from "@angular/common/http";

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

  doiExistsResource = rxResource({
    params: () => ({
      doi: this.formService.getForm().value.publication.doi,
    }),
    stream: ({ params }) => this.dataSiteService.doiExists(params.doi),
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
          this.dataSiteService.uploadDOI(
            result.username,
            result.password,
            this.document(),
            this.doiExistsResource.value(),
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

  private translateError(error: HttpErrorResponse) {
    if (error.status === 401) {
      return "Ungültige Zugangsdaten";
    } else if (error.status === 403) {
      return "Keine Berechtigung zum Hochladen der DOI";
    } else {
      return "DOI konnte nicht hochgeladen werden: " + error.message;
    }
  }
}
