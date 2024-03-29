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
import { inject, Injectable } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { MatDialog } from "@angular/material/dialog";
import { TreeQuery } from "../../../store/tree/tree.query";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { DocumentService } from "../../../services/document/document.service";
import { Router } from "@angular/router";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { EventService, IgeEvent } from "../../../services/event/event.service";
import { filter, take, tap } from "rxjs/operators";
import { DocumentAbstract } from "../../../store/document/document.model";
import { Observable } from "rxjs";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { ConfigService } from "../../../services/config/config.service";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { PluginService } from "../../../services/plugin/plugin.service";
import { FormStateService } from "../../form-state.service";

@Injectable()
export class DeleteDocsPlugin extends Plugin {
  id = "plugin.deleteDocs";
  name = "Delete Docs Plugin";
  description =
    "Fügt einen Button hinzu, um den geöffneten Datensatz zu löschen.";
  group = "Toolbar";
  defaultActive = true;
  hide = true;

  private tree: TreeQuery | AddressTreeQuery;

  constructor(
    private formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private documentService: DocumentService,
    private router: Router,
    private eventService: EventService,
    private dialog: MatDialog,
    private formStateService: FormStateService,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();

    this.setupFields();

    this.formToolbarService.addButton({
      id: "toolBtnRemove",
      tooltip: "Löschen",
      matSvgVariable: "outline-delete-24px",
      eventId: "DELETE",
      pos: 100,
      active: false,
    });

    this.formSubscriptions.push(
      this.docEvents.onEvent("DELETE").subscribe(() => {
        // TODO: this strategy is used in several toolbar plugins to prevent too early execution
        //       when opening page and hitting a toolbar button
        this.tree
          .selectActive()
          .pipe(
            filter((entity) => entity !== undefined),
            take(1),
          )
          .subscribe((docs) => {
            this.eventService
              .sendEventAndContinueOnSuccess(IgeEvent.DELETE, docs)
              .subscribe(() => this.showDeleteDialog(docs));
          });
      }),

      this.tree.selectActive().subscribe((data) => {
        this.formToolbarService.setButtonState(
          "toolBtnRemove",
          data?.length > 0 && !data?.find((doc) => !doc.hasWritePermission),
        );
      }),
    );
  }

  private setupFields() {
    if (this.forAddress) {
      this.tree = this.addressTreeQuery;
    } else {
      this.tree = this.treeQuery;
    }
  }

  showDeleteDialog(docs: DocumentAbstract[]) {
    this.dialog
      .open(ConfirmDialogComponent, {
        hasBackdrop: true,
        data: <ConfirmDialogData>{
          message: "Möchten Sie wirklich diese Datensätze löschen:",
          title: "Löschen",
          list: docs.map((doc) => doc.title),
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Löschen",
              alignRight: true,
              id: "confirm",
              emphasize: true,
            },
          ],
        },
      })
      .afterClosed()
      .pipe(filter((response) => response === "confirm"))
      .subscribe(() => this.deleteDocs(docs).subscribe());
  }

  private selectParent(docs: DocumentAbstract[], currentDoc: DocumentAbstract) {
    const currentDocToBeDeleted = currentDoc
      ? docs.find((doc) => doc.id === currentDoc.id) !== undefined
      : false;
    if (!currentDocToBeDeleted) {
      return;
    }

    const parent = currentDoc._parent;

    const parentEntity = this.tree.getEntity(parent);

    const commands: any[] = [
      ConfigService.catalogId + (this.forAddress ? "/address" : "/form"),
    ];
    if (parent && parentEntity) {
      commands.push({ id: parentEntity._uuid });
    }

    // prevent dirty form check to shown, since the dataset already has been deleted
    this.formStateService.getForm().markAsPristine();
    return this.router.navigate(commands);
  }

  private deleteDocs(docs: DocumentAbstract[]): Observable<void> {
    const docIdsToDelete = docs.map((doc) => <number>doc.id);
    const currentDoc = this.tree.getOpenedDocument();

    return this.documentService.delete(docIdsToDelete, this.forAddress).pipe(
      // TODO: handle update in plugin!?
      tap(() =>
        this.documentService.updateOpenedDocumentInTreestore(
          null,
          this.forAddress,
        ),
      ),
      tap(() => this.selectParent(docs, currentDoc)),
    );
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive) {
      this.formToolbarService.removeButton("toolBtnRemove");
    }
  }
}
