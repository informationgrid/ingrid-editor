import { Injectable } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { ModalService } from "../../../services/modal/modal.service";
import { DocumentService } from "../../../services/document/document.service";
import { TreeQuery } from "../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { merge, Subscription } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { FormStateService } from "../../form-state.service";
import { AbstractControl } from "@angular/forms";
import { catchError, filter } from "rxjs/operators";
import { SaveBase } from "./save.base";
import {
  BeforePublishData,
  DocEventsService,
} from "../../../services/event/doc-events.service";

@Injectable()
export class PublishPlugin extends SaveBase {
  id = "plugin.publish";
  _name = "Publish Plugin";
  group = "Toolbar";
  defaultActive = true;

  eventPublishId = "PUBLISH";
  eventRevertId = "REVERT";
  eventPlanPublishId = "PLAN";
  eventUnpublishId = "UNPUBLISH";

  get name() {
    return this._name;
  }

  constructor(
    public formToolbarService: FormToolbarService,
    private modalService: ModalService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    public dialog: MatDialog,
    public formStateService: FormStateService,
    public documentService: DocumentService,
    private docEvents: DocEventsService
  ) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    this.addToolbarButtons();

    // add event handler for revert
    const toolbarEventSubscription =
      this.formToolbarService.toolbarEvent$.subscribe((eventId) => {
        if (eventId === this.eventRevertId) {
          this.revert();
        } else if (eventId === this.eventPublishId) {
          if (this.validateBeforePublish()) this.publish();
        } else if (eventId === this.eventUnpublishId) {
          this.showUnpublishDialog();
        }
      });

    // add behaviour to set active states for toolbar buttons
    const behaviourSubscription = this.addBehaviour();

    this.subscriptions.push(toolbarEventSubscription, behaviourSubscription);
  }

  private addToolbarButtons() {
    // add button to toolbar for publish action
    this.formToolbarService.addButton({
      id: "toolBtnPublishSeparator",
      isSeparator: true,
      pos: 100,
    });

    this.formToolbarService.addButton({
      id: "toolBtnPublish",
      label: "Veröffentlichen",
      eventId: this.eventPublishId,
      pos: 25,
      align: "right",
      active: false,
      isPrimary: true,
      menu: [
        {
          eventId: this.eventPlanPublishId,
          label: "Planen",
          active: false,
        },
        {
          eventId: this.eventRevertId,
          label: "Auf letzte Veröffentlichung zurücksetzen",
          active: true,
        },
        {
          eventId: this.eventUnpublishId,
          label: "Veröffentlichung zurückziehen",
          active: false,
        },
      ],
    });
  }

  private validateBeforePublish() {
    this.documentService.publishState$.next(true);

    const validation: BeforePublishData = { errors: [] };
    this.docEvents.sendBeforePublish(validation);
    const formIsInvalid = this.formStateService.getForm().invalid;

    const hasOtherErrors = validation.errors.length > 0;
    if (formIsInvalid || hasOtherErrors) {
      const errors = this.calculateErrors(this.getForm().controls).join(",");
      console.warn("Invalid fields:", errors);
      if (hasOtherErrors) console.warn("Other errors:", validation.errors);
      this.modalService.showJavascriptError(
        "Es müssen alle Felder korrekt ausgefüllt werden."
      );
      return false;
    }
    return true;
  }

  publish() {
    // show confirm dialog
    const message = "Wollen Sie diesen Datensatz wirklich veröffentlichen?";
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Veröffentlichen",
          message,
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Veröffentlichen",
              id: "confirm",
              emphasize: true,
              alignRight: true,
            },
          ],
        },
        maxWidth: 700,
      })
      .afterClosed()
      .subscribe((doPublish) => {
        if (doPublish) {
          this.saveWithData(this.getForm().value);
        }
      });
  }

  private showUnpublishDialog() {
    const message =
      "Wollen Sie die Veröffentlichung von diesem Datensatz wirklich zurückziehen?";

    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Veröffentlichung zurückziehen",
          message,
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Zurückziehen",
              id: "confirm",
              emphasize: true,
              alignRight: true,
            },
          ],
        },
        maxWidth: 700,
      })
      .afterClosed()
      .pipe(filter((confirmed) => confirmed))
      .subscribe(() => {
        this.unpublish(this.getIdFromFormData());
      });
  }

  private calculateErrors(controls: { [p: string]: AbstractControl }) {
    return Object.keys(controls).filter((key) => controls[key].invalid);
  }

  saveWithData(data) {
    this.documentService
      .publish(data, this.forAddress)
      .pipe(
        catchError((error) => this.handleError(error, data, this.forAddress))
      )
      .subscribe();
  }

  revert() {
    const doc = this.getForm().value;

    const message =
      "Wollen Sie diesen Datensatz wirklich auf die letzte Veröffentlichungsversion zurücksetzen?";
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Zurücksetzen",
          message,
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Zurücksetzen",
              id: "revert",
              emphasize: true,
              alignRight: true,
            },
          ],
        },
        maxWidth: 700,
      })
      .afterClosed()
      .subscribe((doRevert) => {
        if (doRevert) {
          this.documentService.revert(doc._id, this.forAddress).subscribe(
            () => {},
            (err) => {
              console.log("Error when reverting data", err);
              throw err;
            }
          );
        }
      });
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton("toolBtnPublishSeparator");
    this.formToolbarService.removeButton("toolBtnPublish");
  }

  /**
   * When a dataset is loaded or changed then notify the toolbar to enable/disable button state.
   */
  private addBehaviour(): Subscription {
    return merge(
      this.treeQuery.openedDocument$,
      this.addressTreeQuery.openedDocument$
    ).subscribe((loadedDocument) => {
      this.formToolbarService.setButtonState(
        "toolBtnPublish",
        loadedDocument !== null &&
          loadedDocument._type !== "FOLDER" &&
          loadedDocument.hasWritePermission
      );
      this.formToolbarService.setMenuItemStateOfButton(
        "toolBtnPublish",
        this.eventRevertId,
        loadedDocument !== null && loadedDocument._state === "PW"
      );
      this.formToolbarService.setMenuItemStateOfButton(
        "toolBtnPublish",
        this.eventUnpublishId,
        loadedDocument !== null &&
          (loadedDocument._state === "PW" || loadedDocument._state === "P")
      );
    });
  }

  private unpublish(id: string) {
    this.documentService.unpublish(id, this.forAddress).subscribe();
  }
}
