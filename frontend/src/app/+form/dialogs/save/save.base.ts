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
import { IgeDocument, Metadata } from "../../../models/ige-document";
import { Observable, of } from "rxjs";
import {
  VersionConflictChoice,
  VersionConflictDialogComponent,
} from "../version-conflict-dialog/version-conflict-dialog.component";
import { IgeError } from "../../../models/ige-error";
import { FormMessageService } from "../../../services/form-message.service";
import { MatDialog } from "@angular/material/dialog";
import { SessionStore, ValidationError } from "../../../store/session.store";
import { FormStateService } from "../../form-state.service";
import { DocumentService } from "../../../services/document/document.service";
import { tap } from "rxjs/operators";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { inject } from "@angular/core";
import { Plugin } from "../../../+catalog/+behaviours/plugin";

export abstract class SaveBase extends Plugin {
  sessionStore = inject(SessionStore);
  messageService = inject(FormMessageService);
  formStateService = inject(FormStateService);

  dialog: MatDialog;
  documentService: DocumentService;
  formToolbarService: FormToolbarService;

  handleError(
    error,
    data: Metadata,
    address: boolean,
    saveType: "PUBLISH" | "SAVE",
  ): Observable<void> {
    let errorText = error?.error?.errorText;
    if (error?.error?.errorCode === "POST_SAVE_ERROR") {
      console.error(errorText);
      if (
        errorText?.indexOf(
          "No connection to Elasticsearch: RequestIsWrong 401",
        ) !== -1
      ) {
        errorText =
          "Keine Verbindung zu Elasticsearch (ungültige Zugangsdaten)";
      }
      this.messageService.sendError(
        `Der Datensatz wurde erfolgreich in der Datenbank ${
          saveType === "PUBLISH" ? "veröffentlicht" : "gespeichert"
        }, jedoch trat ein Problem danach auf: ` + errorText,
      );
      this.loadDocument(data.wrapperId, address);
    } else if (error?.error?.errorCode === "VERSION_CONFLICT") {
      this.dialog
        .open(VersionConflictDialogComponent)
        .afterClosed()
        .subscribe((choice) =>
          this.handleAfterConflictChoice(
            choice,
            error.error.data.databaseVersion,
            address,
          ),
        );
    } else if (
      error?.status === 400 &&
      (error?.error.errorCode === "VALIDATION_ERROR" ||
        error?.error.errorCode === "VALIDATION_ERROR_FIELD")
    ) {
      throw this.prepareValidationError(error);
    } else {
      this.messageService.sendError(
        `Der Datensatz wurde nicht erfolgreich ${
          saveType === "PUBLISH" ? "veröffentlicht" : "gespeichert"
        }` + (errorText ?? ""),
      );
      throw error;
    }
    return of();
  }

  protected prepareValidationError(error) {
    if (error.error.errorCode === "VALIDATION_ERROR_FIELD") {
      this.sessionStore.update(() => {
        return {
          serverValidationErrors: error.error.data.fields,
        };
      });
      throw new IgeError(
        "Bei der Validierung trat ein Fehler auf. Bitte prüfen Sie das Formular.",
      );
    }

    console.error("JSON schema error:", error.error.data);
    const isJsonSchemaError = error?.error?.data?.error instanceof Array;
    if (!isJsonSchemaError) throw error;

    const igeError = new IgeError(
      "Es trat ein Fehler bei der JSON-Schema Validierung auf.",
    );

    igeError.detail = error?.error?.data?.error
      ?.filter((item) => item.error.indexOf("A subschema had errors") === -1)
      ?.map((item) => `${item.instanceLocation}: ${item.error}`)
      ?.join("\n");

    this.handleJsonSchemaErrors(error);
    igeError.unhandledException = true;
    return igeError;
  }

  private handleJsonSchemaErrors(error: any) {
    const invalidFields: string[] = error.error.data.error
      .map((e: any) => {
        const correctStart = e.instanceLocation.indexOf("#/") === 0;
        const noTrailingSlash = e.instanceLocation.indexOf("/", 2) === -1;
        if (!correctStart || !noTrailingSlash) return null;

        return e.instanceLocation.substring(2);
      })
      .filter((e: any) => e !== null);

    const invalidFieldsErrors: ValidationError[] = [
      ...new Set(invalidFields),
    ].map((e) => ({
      name: e,
      errorCode: "JSON_SCHEMA",
    }));

    this.sessionStore.update(() => {
      return {
        serverValidationErrors: invalidFieldsErrors,
      };
    });
  }

  abstract saveWithData(data: IgeDocument);

  private handleAfterConflictChoice(
    choice: VersionConflictChoice,
    latestVersion: number,
    address: boolean,
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
    const data = this.getForm()?.getRawValue();
    data["_version"] = version;
    return data;
  }

  protected getIdFromFormData() {
    return this.getMetadata().wrapperId;
  }

  protected getForm() {
    return this.formStateService.getForm();
  }

  protected getMetadata() {
    return this.formStateService.metadata();
  }

  private loadDocument(id: number, address: boolean) {
    this.documentService
      .load(id, address)
      .pipe(
        tap((data) =>
          // @ts-ignore
          this.documentService.postSaveActions({
            isNewDoc: false,
            isAddress: address,
            dataWithMetadata: data,
          }),
        ),
      )
      .subscribe();
  }
}
