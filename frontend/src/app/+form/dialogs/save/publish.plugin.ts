import { inject, Injectable } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { ModalService } from "../../../services/modal/modal.service";
import { DocumentService } from "../../../services/document/document.service";
import { TreeQuery } from "../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { of, Subscription } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { catchError, filter, tap } from "rxjs/operators";
import { SaveBase } from "./save.base";
import { DelayedPublishDialogComponent } from "./delayed-publish-dialog/delayed-publish-dialog.component";
import {
  BeforePublishData,
  DocEventsService,
} from "../../../services/event/doc-events.service";
import { SessionStore } from "../../../store/session.store";
import { FormMessageService } from "../../../services/form-message.service";
import { IgeError } from "../../../models/ige-error";
import { PluginService } from "../../../services/plugin/plugin.service";
import { TranslocoService } from "@ngneat/transloco";

@Injectable()
export class PublishPlugin extends SaveBase {
  id = "plugin.publish";
  name = "Publish Plugin";
  description =
    "Fügt einen Button zum Veröffentlichen eines Datensatzes hinzu.";
  group = "Toolbar";
  defaultActive = true;
  hide = true;

  eventPublishId = "PUBLISH";
  eventRevertId = "REVERT";
  eventPlanPublishId = "PLAN";
  eventUnpublishId = "UNPUBLISH";
  eventValidate = "VALIDATE";
  private tree: TreeQuery | AddressTreeQuery;

  constructor(
    public formToolbarService: FormToolbarService,
    private modalService: ModalService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    public dialog: MatDialog,
    public documentService: DocumentService,
    private docEvents: DocEventsService,
    private transloco: TranslocoService,
    messageService: FormMessageService,
    sessionStore: SessionStore,
  ) {
    super(sessionStore, messageService);
    inject(PluginService).registerPlugin(this);
  }

  registerForm() {
    super.registerForm();

    this.setupTree();

    this.addToolbarButtons();

    // add event handler for revert
    const toolbarEventSubscription = [
      this.docEvents.onEvent(this.eventRevertId).subscribe(() => this.revert()),
      this.docEvents
        .onEvent(this.eventPublishId)
        .subscribe(() => this.validateBeforePublish() && this.publish()),
      this.docEvents
        .onEvent(this.eventPlanPublishId)
        .subscribe(
          () => this.validateBeforePublish() && this.showPlanPublishingDialog(),
        ),
      this.docEvents
        .onEvent(this.eventUnpublishId)
        .subscribe(() => this.showUnpublishDialog()),
      this.docEvents
        .onEvent(this.eventValidate)
        .subscribe(() => this.validateDataset()),
    ];

    // add behaviour to set active states for toolbar buttons
    const behaviourSubscription = this.addBehaviour();

    this.formSubscriptions.push(
      ...toolbarEventSubscription,
      behaviourSubscription,
    );
  }

  private setupTree() {
    if (this.forAddress) {
      this.tree = this.addressTreeQuery;
    } else {
      this.tree = this.treeQuery;
    }
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
          eventId: this.eventPublishId,
          label: "Jetzt veröffentlichen",
          active: true,
        },
        {
          eventId: this.eventPlanPublishId,
          label: "Veröffentlichung planen",
          active: true,
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
        {
          eventId: this.eventValidate,
          label: "Veröffentlichung prüfen",
          active: true,
        },
      ],
    });
  }

  private validateBeforePublish() {
    this.messageService.clearMessages$.next();

    this.documentService.publishState$.next(true);

    const validation: BeforePublishData = { errors: [] };
    this.docEvents.sendBeforePublish(validation);
    const formIsInvalid = this.formStateService.getForm().invalid;

    const allParentsPublished = this.checkForAllParentsPublished();

    const hasOtherErrors = validation.errors.length > 0;

    if (!allParentsPublished) {
      this.modalService.showJavascriptError(
        "Es müssen alle übergeordnete Datensätze veröffentlicht sein, bevor dieser ebenfalls veröffentlicht werden kann.",
      );
      return false;
    } else {
      if (formIsInvalid || hasOtherErrors) {
        if (hasOtherErrors) console.warn("Other errors:", validation.errors);
        console.warn(this.formStateService.getForm());
        const validationErrors = this.extractFormValidationErrors(
          this.formStateService.getForm().controls,
        );
        const error = new IgeError(
          "Es müssen alle Felder korrekt ausgefüllt werden. " +
            "STRG + ALT + R zum vorherigen Fehler. " +
            "STRG + ALT + W zum nächsten Fehler.",
        );
        if (validationErrors.length > 0) error.items = validationErrors;
        this.modalService.showIgeError(error);
        return false;
      }
      return true;
    }
  }

  publish() {
    // show confirm dialog
    const message = this.transloco.translate("publish.confirmMessage");
    this.dialog
      .open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: "Veröffentlichen",
          message,
          buttons: [
            { text: "Abbrechen" },
            { text: "Veröffentlichung Planen", id: "plan" },
            {
              text: "Veröffentlichen",
              id: "confirm",
              emphasize: true,
              alignRight: true,
            },
          ],
        },
        maxWidth: 700,
        delayFocusTrap: true,
      })
      .afterClosed()
      .subscribe((decision) => {
        if (decision === "confirm") {
          this.saveWithData(this.getForm().value);
        } else if (decision === "plan") {
          this.showPlanPublishingDialog();
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
        delayFocusTrap: true,
      })
      .afterClosed()
      .pipe(filter((confirmed) => confirmed))
      .subscribe(() => {
        this.unpublish(this.getIdFromFormData());
      });
  }

  private showPlanPublishingDialog() {
    this.dialog
      .open(DelayedPublishDialogComponent)
      .afterClosed()
      .pipe(filter((date) => date))
      .subscribe((date) => {
        this.saveWithData(this.getForm().value, date);
      });
  }

  saveWithData(data, delay: Date = null) {
    this.documentService
      .publish(data, this.forAddress, delay)
      .pipe(
        catchError((error) =>
          this.handleError(error, data, this.forAddress, "PUBLISH"),
        ),
        tap((response) => {
          if (delay != null) {
            this.documentService.reload$.next({
              uuid: data._uuid,
              forAddress: this.forAddress,
            });
          }
        }),
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
        delayFocusTrap: true,
      })
      .afterClosed()
      .subscribe((doRevert) => {
        if (doRevert) {
          this.documentService.revert(doc._id, this.forAddress).subscribe(
            () => {},
            (err) => {
              console.log("Error when reverting data", err);
              throw err;
            },
          );
        }
      });
  }

  unregisterForm() {
    super.unregisterForm();

    if (this.isActive) {
      this.formToolbarService.removeButton("toolBtnPublishSeparator");
      this.formToolbarService.removeButton("toolBtnPublish");
    }
  }

  /**
   * When a dataset is loaded or changed then notify the toolbar to enable/disable button state.
   */
  private addBehaviour(): Subscription {
    return this.tree.openedDocument$.subscribe((loadedDocument) => {
      this.formToolbarService.setButtonState(
        "toolBtnPublish",
        loadedDocument !== null &&
          loadedDocument._pendingDate == null &&
          loadedDocument._type !== "FOLDER" &&
          loadedDocument.hasWritePermission,
      );
      this.formToolbarService.setMenuItemStateOfButton(
        "toolBtnPublish",
        this.eventRevertId,
        loadedDocument !== null && loadedDocument._state === "PW",
      );
      this.formToolbarService.setMenuItemStateOfButton(
        "toolBtnPublish",
        this.eventUnpublishId,
        loadedDocument !== null &&
          (loadedDocument._state === "PW" || loadedDocument._state === "P"),
      );
    });
  }

  private unpublish(id: number) {
    this.documentService.unpublish(id, this.forAddress).subscribe();
  }

  private checkForAllParentsPublished() {
    const id: number = this.getForm().value._id;
    return this.tree
      .getParents(id)
      .every((entity) => entity._type === "FOLDER" || entity._state === "P");
  }

  private validateDataset() {
    const isValid = this.validateBeforePublish();
    this.documentService
      .validateDocument(this.getForm().value._id)
      .pipe(
        catchError((e) => {
          const error = this.prepareValidationError(e);
          error.unhandledException = false;
          this.modalService.showIgeError(error);
          return of(error);
        }),
      )
      .subscribe((result) => {
        console.log("backendValidation: ", result);
        if (!isValid || result instanceof IgeError) return;

        this.modalService.confirmWith({
          title: "Prüfung",
          message: "Der Datensatz wurde erfolgreich geprüft.",
          hideCancelButton: true,
        });
        this.documentService.publishState$.next(false);
      });
    console.log("isValid: ", isValid);
  }

  private extractFormValidationErrors(controls): string[] {
    const errors: string[] = [];
    Object.keys(controls).forEach((controlKey) => {
      let control = controls[controlKey];
      if (
        control.invalid &&
        control.errors != null &&
        Object.keys(control.errors).length > 0
      ) {
        const controlLabel = control._fields[0].props.externalLabel;
        const errorKey = Object.keys(control.errors)[0];
        const error = control.errors[errorKey];
        if (error.message) errors.push(controlLabel + ": " + error.message);
        else
          errors.push(
            controlLabel +
              ": " +
              this.transloco.translate("form.validationMessages." + errorKey),
          );
      }
    });
    return errors;
  }
}
