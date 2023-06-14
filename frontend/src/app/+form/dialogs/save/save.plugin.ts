import { Inject, Injectable } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { ModalService } from "../../../services/modal/modal.service";
import { DocumentService } from "../../../services/document/document.service";
import { TreeQuery } from "../../../store/tree/tree.query";
import { IgeDocument } from "../../../models/ige-document";
import { MatDialog } from "@angular/material/dialog";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { catchError, finalize } from "rxjs/operators";
import { FormStateService } from "../../form-state.service";
import { SaveBase } from "./save.base";
import { SessionStore } from "../../../store/session.store";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { FormMessageService } from "../../../services/form-message.service";
import { DOCUMENT } from "@angular/common";
import { IgeError } from "../../../models/ige-error";

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
    private modalService: ModalService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    public dialog: MatDialog,
    public formStateService: FormStateService,
    public documentService: DocumentService,
    sessionStore: SessionStore,
    messageService: FormMessageService,
    @Inject(DOCUMENT) private _document: Document
  ) {
    super(sessionStore, messageService);
  }

  register() {
    super.register();

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
            openedDoc.hasWritePermission
        );

        // do not allow to modify form if multiple nodes have been selected in tree
        // openedDoc !== null ? this.form.enable() : this.form.disable();
      }
    );

    this.subscriptions.push(toolbarEventSubscription, treeSubscription);
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

    this.handleValidationOnSave();

    return this.documentService
      .save({ data: formData, isNewDoc: false, isAddress: this.forAddress })
      .pipe(
        catchError((error) =>
          this.handleError(error, formData, this.forAddress, "SAVE")
        ),
        finalize(() =>
          this.formToolbarService.setButtonState("toolBtnSave", true)
        )
      )
      .subscribe();
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton("toolBtnSave");
  }

  private handleValidationOnSave() {
    const numErrors = this._document.querySelectorAll("mat-error");
    console.log("Num Errors during save: ", numErrors);
    if (numErrors.length > 0) {
      this.formToolbarService.setButtonState("toolBtnSave", true);
      throw new IgeError(
        "Es gibt Fehler im Formular. Bitte korrigieren Sie die Eingaben."
      );
    }
  }
}
