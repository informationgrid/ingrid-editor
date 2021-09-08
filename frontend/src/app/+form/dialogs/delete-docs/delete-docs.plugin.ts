import { Injectable } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
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
import { filter, take } from "rxjs/operators";
import { DocumentAbstract } from "../../../store/document/document.model";

@Injectable()
export class DeleteDocsPlugin extends Plugin {
  id = "plugin.deleteDocs";
  _name = "Delete Docs Plugin";
  group = "Toolbar";
  defaultActive = true;

  private tree: TreeQuery | AddressTreeQuery;

  get name() {
    return this._name;
  }

  constructor(
    private formToolbarService: FormToolbarService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private documentService: DocumentService,
    private router: Router,
    private eventService: EventService,
    private dialog: MatDialog
  ) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    this.setupFields();

    this.formToolbarService.addButton({
      id: "toolBtnRemove",
      tooltip: "Löschen",
      matSvgVariable: "outline-delete-24px",
      eventId: "DELETE",
      pos: 100,
      active: false,
    });

    this.subscriptions.push(
      this.formToolbarService.toolbarEvent$.subscribe((eventId) => {
        if (eventId === "DELETE") {
          this.eventService
            .sendEventAndContinueOnSuccess(IgeEvent.DELETE)
            .subscribe(() => this.showDeleteDialog());
        }
      }),

      this.treeQuery.selectActive().subscribe((data) => {
        this.formToolbarService.setButtonState(
          "toolBtnRemove",
          data?.length > 0 && !data?.find((doc) => !doc.hasWritePermission)
        );
      }),

      this.addressTreeQuery.selectActive().subscribe((data) => {
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
          .subscribe(() => this.handleDeleteDocs(docs));
      });
  }

  private handleDeleteDocs(docs: DocumentAbstract[]) {
    const currentDoc = this.tree.getOpenedDocument();
    this.deleteDocs(docs.map((doc) => <string>doc.id));
    this.selectParent(docs, currentDoc);
  }

  private selectParent(docs: DocumentAbstract[], currentDoc: DocumentAbstract) {
    const currentDocToBeDeleted = currentDoc
      ? docs.find((doc) => doc.id === currentDoc.id) !== undefined
      : false;
    if (!currentDocToBeDeleted) {
      return;
    }

    const route = this.forAddress ? "/address" : "/form";
    const parent = currentDoc._parent;

    if (parent) {
      this.router.navigate([route, { id: currentDoc._parent }]);
    } else {
      this.router.navigate([route]);
    }
  }

  private deleteDocs(docIdsToDelete: string[]) {
    try {
      // const parents = this.treeQuery.getAll()
      //   .filter(doc => docIdsToDelete.indexOf(doc.id.toString()) !== -1)
      //   .map(doc => doc._parent);

      this.documentService.delete(docIdsToDelete, this.forAddress);

      this.documentService.updateOpenedDocumentInTreestore(
        null,
        this.forAddress
      );

      // find all parents in store who now have no children anymore
      // parents
      //   .filter(id => this.treeQuery.getCount(item => item._parent === id) === 0)
      //   .forEach( id => this.documentService.updateChildrenInfo(id, false));
    } catch (ex) {
      console.error("Could not delete", ex);
    }
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton("toolBtnRemove");
  }
}
