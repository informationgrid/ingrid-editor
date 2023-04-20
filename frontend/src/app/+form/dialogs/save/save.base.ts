import { IgeDocument } from "../../../models/ige-document";
import { Observable, of } from "rxjs";
import {
  VersionConflictChoice,
  VersionConflictDialogComponent,
} from "../version-conflict-dialog/version-conflict-dialog.component";
import { IgeError } from "../../../models/ige-error";
import { FormMessageService } from "../../../services/form-message.service";
import { MatDialog } from "@angular/material/dialog";
import { SessionStore } from "../../../store/session.store";
import { FormStateService } from "../../form-state.service";
import { DocumentService } from "../../../services/document/document.service";
import { tap } from "rxjs/operators";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";

export abstract class SaveBase extends Plugin {
  dialog: MatDialog;
  formStateService: FormStateService;
  documentService: DocumentService;
  formToolbarService: FormToolbarService;

  protected constructor(
    public sessionStore: SessionStore,
    public messageService: FormMessageService
  ) {
    super();
  }

  handleError(
    error,
    data: IgeDocument,
    address: boolean,
    saveType: "PUBLISH" | "SAVE"
  ): Observable<void> {
    if (error?.error?.errorCode === "POST_SAVE_ERROR") {
      console.error(error?.error?.errorText);
      this.messageService.sendError(
        `Der Datensatz wurde erfolgreich in der Datenbank ${
          saveType === "PUBLISH" ? "veröffentlicht" : "gespeichert"
        }, jedoch trat ein Problem danach auf: ` + error?.error?.errorText
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
      console.error("JSON schema error:", error.error.data);
      const igeError = new IgeError(
        "Es trat ein Fehler bei der JSON-Schema Validierung auf."
      );
      igeError.detail = error?.error?.data?.error
        ?.map((item) => item.error)
        ?.filter((item) => item.indexOf("A subschema had errors") === -1)
        ?.join("\n");
      throw igeError;

      // TODO: update store to show backend validation errors in form
      /*this.sessionStore.update({
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
      */
    } else {
      this.messageService.sendError(
        `Der Datensatz wurde nicht erfolgreich ${
          saveType === "PUBLISH" ? "veröffentlicht" : "gespeichert"
        }` + (error?.error?.errorText ?? "")
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

  private loadDocument(id: number, address: boolean) {
    this.documentService
      .load(id, address)
      .pipe(
        tap((data) =>
          this.documentService.postSaveActions({
            data: data,
            isNewDoc: false,
            isAddress: address,
          })
        )
      )
      .subscribe();
  }
}
