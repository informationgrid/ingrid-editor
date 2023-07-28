import { inject, Injectable } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { MatDialog } from "@angular/material/dialog";
import { TreeQuery } from "../../../store/tree/tree.query";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { DocumentService } from "../../../services/document/document.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { EventService, IgeEvent } from "../../../services/event/event.service";
import { filter, take, tap } from "rxjs/operators";
import { DocumentAbstract } from "../../../store/document/document.model";
import { Observable } from "rxjs";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { ConfigService } from "../../../services/config/config.service";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { PluginService } from "../../../services/plugin/plugin.service";

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
    private route: ActivatedRoute,
    private eventService: EventService,
    private dialog: MatDialog
  ) {
    super();
    this.isActive = true;
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
        this.eventService
          .sendEventAndContinueOnSuccess(IgeEvent.DELETE)
          .subscribe(() => this.showDeleteDialog());
      }),

      this.tree.selectActive().subscribe((data) => {
        this.formToolbarService.setButtonState(
          "toolBtnRemove",
          data?.length > 0 && !data?.find((doc) => !doc.hasWritePermission)
        );
      })
    );
  }

  private setupFields() {
    if (this.forAddress) {
      this.tree = this.addressTreeQuery;
    } else {
      this.tree = this.treeQuery;
    }
  }

  showDeleteDialog() {
    // TODO: this strategy is used in several toolbar plugins to prevent too early execution
    //       when opening page and hitting a toolbar button
    this.tree
      .selectActive()
      .pipe(
        filter((entity) => entity !== undefined),
        take(1)
      )
      .subscribe((docs) => {
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
      });
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
    this.router.navigate(commands);
  }

  private deleteDocs(docs: DocumentAbstract[]): Observable<void> {
    const docIdsToDelete = docs.map((doc) => <number>doc.id);
    const currentDoc = this.tree.getOpenedDocument();

    return this.documentService.delete(docIdsToDelete, this.forAddress).pipe(
      // TODO: handle update in plugin!?
      tap(() =>
        this.documentService.updateOpenedDocumentInTreestore(
          null,
          this.forAddress
        )
      ),
      tap(() => this.selectParent(docs, currentDoc))
    );
  }

  unregisterForm() {
    super.unregisterForm();

    this.formToolbarService.removeButton("toolBtnRemove");
  }
}
