import { IgeDocument } from "../../../models/ige-document";
import { Observable, of } from "rxjs";
import {
  VersionConflictChoice,
  VersionConflictDialogComponent,
} from "../version-conflict-dialog/version-conflict-dialog.component";
import { ServerValidation } from "../../../server-validation.util";
import { ErrorDialogComponent } from "../../../dialogs/error/error-dialog.component";
import { IgeError } from "../../../models/ige-error";
import { MessageService } from "../../../services/message.service";
import { MatDialog } from "@angular/material/dialog";
import { SessionStore } from "../../../store/session.store";
import { FormStateService } from "../../form-state.service";
import { DocumentService } from "../../../services/document/document.service";
import { tap } from "rxjs/operators";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";

export abstract class SaveBase extends Plugin {
  messageService: MessageService;
  dialog: MatDialog;
  sessionStore: SessionStore;
  formStateService: FormStateService;
  documentService: DocumentService;
  formToolbarService: FormToolbarService;

  handleError(error, data: IgeDocument, address: boolean): Observable<void> {
    if (error?.error?.errorCode === "POST_SAVE_ERROR") {
      console.error(error?.error?.errorText);
      this.messageService.sendError(
        "Der Datensatz wurde erfolgreich in der Datenbank veröffentlicht, jedoch trat ein Problem danach auf: " +
          error?.error?.errorText
      );
      this.loadDocument(data._id, address);
    } else if (error?.error?.errorCode === "VERSION_CONFLICT") {
      this.dialog
        .open(VersionConflictDialogComponent)
        .afterClosed()
        .subscribe((choice) =>
          this.handleAfterConflictChoice(
            choice,
            error.error.data.databaseVersion,
            address
          )
        );
    } else if (
      error?.status === 400 &&
      error?.error.errorCode === "VALIDATION_ERROR"
    ) {
      this.sessionStore.update({
        serverValidationErrors: ServerValidation.prepareServerValidationErrors(
          error.error.data
        ),
      });
      this.dialog.open(ErrorDialogComponent, {
        data: new IgeError(
          "Beim Veröffentlichen wurden Fehler im Formular entdeckt"
          // error: {message: ServerValidation.prepareServerError(error?.error)})
        ),
      });
    } else {
      this.messageService.sendError(
        "Der Datensatz wurde nicht erfolgreich veröffentlicht: " +
          error?.error?.errorText
      );
      throw error;
    }
    return of();
  }

  abstract saveWithData(data: IgeDocument);

  private handleAfterConflictChoice(
    choice: VersionConflictChoice,
    latestVersion: number,
    address: boolean
  ) {
    switch (choice) {
      case "cancel":
        this.documentService.documentOperationFinished$.next(true);
        this.formToolbarService.setButtonState("toolBtnSave", true);
        break;
      case "force":
        const formData = this.getFormDataWithVersionInfo(latestVersion);
        this.saveWithData(formData);
        break;
      case "reload":
        this.loadDocument(this.getIdFromFormData(), address);
        break;
    }
  }

  private getFormDataWithVersionInfo(version: number) {
    const data = this.getForm()?.value;
    data["_version"] = version;
    return data;
  }

  protected getIdFromFormData() {
    return this.getForm()?.value["_id"];
  }

  protected getForm() {
    return this.formStateService.getForm();
  }

  private loadDocument(id: string, address: boolean) {
    this.documentService
      .load(id, address)
      .pipe(
        tap((data) => this.documentService.handleAfterPublish(data, address))
      )
      .subscribe();
  }
}
