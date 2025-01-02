/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { effect, inject, Inject, Injectable } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { DocumentService } from "../../../services/document/document.service";
import { IgeDocument } from "../../../models/ige-document";
import { MatDialog } from "@angular/material/dialog";
import { catchError, finalize } from "rxjs/operators";
import { SaveBase } from "./save.base";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { DOCUMENT } from "@angular/common";
import { IgeError } from "../../../models/ige-error";
import { PluginService } from "../../../services/plugin/plugin.service";

@Injectable()
export class SavePlugin extends SaveBase {
  id = "plugin.save";
  name = "Save Plugin";
  description = "Einblenden eines Buttons zum Speichern eines Datensatzes";
  group = "Toolbar";
  defaultActive = true;
  hide = true;

  constructor(
    public formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    public dialog: MatDialog,
    public documentService: DocumentService,
    @Inject(DOCUMENT) private _document: Document,
  ) {
    super();
    inject(PluginService).registerPlugin(this);

    effect(() => {
      if (!this.formRegistered) return;
      const doc = this.generalStore.getOpenedDocument(this.forAddress());
      this.formToolbarService.setButtonState(
        "toolBtnSave",
        doc !== null && doc._pendingDate == null && doc.hasWritePermission,
      );
    });
  }

  registerForm() {
    super.registerForm();

    // add button to toolbar for publish action
    this.formToolbarService.addButton({
      id: "toolBtnSave",
      label: "Speichern",
      matIconVariable: "save",
      eventId: "SAVE",
      pos: 20,
      active: false,
      align: "right",
    });

    // add event handler for revert
    const toolbarEventSubscription = this.docEvents
      .onEvent("SAVE")
      .subscribe(() => {
        const form: IgeDocument = this.getForm()?.getRawValue();
        if (form) {
          this.formToolbarService.setButtonState("toolBtnSave", false);
          this.saveWithData(form);
        }
      });

    this.formSubscriptions.push(toolbarEventSubscription);
  }

  saveWithData(formData: IgeDocument) {
    this.documentService.publishState$.next(false);

    // delay execution to reset error messages after publish state has been set to false
    setTimeout(() => {
      this.handleValidationOnSave();

      const metadata = this.getMetadata();

      return this.documentService
        .save({
          data: formData,
          id: metadata.wrapperId,
          version: metadata.version,
          isNewDoc: false,
          isAddress: this.forAddress(),
          type: metadata.docType,
        })
        .pipe(
          catchError((error) =>
            this.handleError(error, metadata, this.forAddress(), "SAVE"),
          ),
          finalize(() =>
            this.formToolbarService.setButtonState("toolBtnSave", true),
          ),
        )
        .subscribe();
    });
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive) {
      this.formToolbarService.removeButton("toolBtnSave");
    }
  }

  private handleValidationOnSave() {
    const numErrors = this._document.querySelectorAll("mat-error");
    if (numErrors.length > 0) {
      console.warn("Num Errors during save: ", numErrors);
      this.formToolbarService.setButtonState("toolBtnSave", true);
      throw new IgeError(
        "Es gibt Fehler im Formular. Bitte korrigieren Sie die Eingaben.",
      );
    }
  }
}
