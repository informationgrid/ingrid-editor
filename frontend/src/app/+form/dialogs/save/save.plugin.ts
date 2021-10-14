import { Injectable } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { ModalService } from "../../../services/modal/modal.service";
import { DocumentService } from "../../../services/document/document.service";
import { TreeQuery } from "../../../store/tree/tree.query";
import { MessageService } from "../../../services/message.service";
import { IgeDocument } from "../../../models/ige-document";
import { MatDialog } from "@angular/material/dialog";
import { merge } from "rxjs";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { catchError, filter } from "rxjs/operators";
import { FormStateService } from "../../form-state.service";
import { SaveBase } from "./save.base";

@Injectable()
export class SavePlugin extends SaveBase {
  id = "plugin.save";
  _name = "Save Plugin";
  group = "Toolbar";
  defaultActive = true;

  get name() {
    return this._name;
  }

  constructor(
    public formToolbarService: FormToolbarService,
    private modalService: ModalService,
    public messageService: MessageService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    public dialog: MatDialog,
    public formStateService: FormStateService,
    public documentService: DocumentService
  ) {
    super();
  }

  register() {
    super.register();

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
    const toolbarEventSubscription = this.formToolbarService.toolbarEvent$
      .pipe(filter((eventId) => eventId === "SAVE"))
      .subscribe(() => {
        const form: IgeDocument = this.getForm()?.value;
        if (form) {
          this.formToolbarService.setButtonState("toolBtnSave", false);
          this.saveWithData(form);
        }
      });

    // react on document selection
    const treeSubscription = merge(
      this.treeQuery.openedDocument$,
      this.addressTreeQuery.openedDocument$
    ).subscribe((openedDoc) => {
      this.formToolbarService.setButtonState(
        "toolBtnSave",
        openedDoc !== null && openedDoc.hasWritePermission
      );

      // do not allow to modify form if multiple nodes have been selected in tree
      // openedDoc !== null ? this.form.enable() : this.form.disable();
    });

    this.subscriptions.push(toolbarEventSubscription, treeSubscription);
  }

  saveWithData(formData: IgeDocument) {
    this.documentService.publishState$.next(false);

    return this.documentService
      .save(formData, false, this.forAddress)
      .pipe(
        catchError((error) =>
          this.handleError(error, formData, this.forAddress)
        )
      )
      .subscribe(() =>
        this.formToolbarService.setButtonState("toolBtnSave", true)
      );
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton("toolBtnSave");
  }
}
