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
import { inject, Inject, Injectable } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { DocumentService } from "../../../services/document/document.service";
import { TreeQuery } from "../../../store/tree/tree.query";
import { IgeDocument } from "../../../models/ige-document";
import { MatDialog } from "@angular/material/dialog";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { catchError, finalize } from "rxjs/operators";
import { SaveBase } from "./save.base";
import { SessionStore } from "../../../store/session.store";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { FormMessageService } from "../../../services/form-message.service";
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
  private tree: TreeQuery | AddressTreeQuery;

  constructor(
    public formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    public dialog: MatDialog,
    public documentService: DocumentService,
    sessionStore: SessionStore,
    messageService: FormMessageService,

    @Inject(DOCUMENT) private _document: Document,
  ) {
    super(sessionStore, messageService);
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();

    this.setupTree();

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
        const form: IgeDocument = this.getForm()?.value;
        if (form) {
          this.formToolbarService.setButtonState("toolBtnSave", false);
          this.saveWithData(form);
        }
      });

    // react on document selection
    const treeSubscription = this.tree.openedDocument$.subscribe(
      (openedDoc) => {
        this.formToolbarService.setButtonState(
          "toolBtnSave",
          openedDoc !== null &&
            openedDoc._pendingDate == null &&
            openedDoc.hasWritePermission,
        );

        // do not allow to modify form if multiple nodes have been selected in tree
        // openedDoc !== null ? this.form.enable() : this.form.disable();
      },
    );

    this.formSubscriptions.push(toolbarEventSubscription, treeSubscription);
  }

  private setupTree() {
    if (this.forAddress) {
      this.tree = this.addressTreeQuery;
    } else {
      this.tree = this.treeQuery;
    }
  }

  saveWithData(formData: IgeDocument) {
    this.documentService.publishState$.next(false);

    // delay execution to reset error messages after publish state has been set to false
    setTimeout(() => {
      this.handleValidationOnSave();

      return this.documentService
        .save({ data: formData, isNewDoc: false, isAddress: this.forAddress })
        .pipe(
          catchError((error) =>
            this.handleError(error, formData, this.forAddress, "SAVE"),
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
    console.log("Num Errors during save: ", numErrors);
    if (numErrors.length > 0) {
      this.formToolbarService.setButtonState("toolBtnSave", true);
      throw new IgeError(
        "Es gibt Fehler im Formular. Bitte korrigieren Sie die Eingaben.",
      );
    }
  }
}
