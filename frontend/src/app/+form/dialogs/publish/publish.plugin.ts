import {Injectable} from '@angular/core';
import {FormToolbarService} from '../../form-shared/toolbar/form-toolbar.service';
import {ModalService} from '../../../services/modal/modal.service';
import {DocumentService} from '../../../services/document/document.service';
import {Plugin} from '../../../+catalog/+behaviours/plugin';
import {TreeQuery} from '../../../store/tree/tree.query';
import {MessageService} from '../../../services/message.service';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {merge, Subscription} from 'rxjs';
import {IgeDocument} from '../../../models/ige-document';
import {HttpErrorResponse} from '@angular/common/http';
import {VersionConflictChoice, VersionConflictDialogComponent} from '../version-conflict-dialog/version-conflict-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent, ConfirmDialogData} from '../../../dialogs/confirm/confirm-dialog.component';
import {ErrorDialogComponent} from '../../../dialogs/error/error-dialog.component';
import {IgeError} from '../../../models/ige-error';
import {SessionStore} from '../../../store/session.store';
import {ServerValidation} from '../../../server-validation.util';
import {FormStateService} from "../../form-state.service";
import {AbstractControl, FormGroup} from "@angular/forms";

@Injectable()
export class PublishPlugin extends Plugin {
  id = 'plugin.publish';
  _name = 'Publish Plugin';
  group = 'Toolbar';
  defaultActive = true;

  eventPublishId = 'PUBLISH';
  eventRevertId = 'REVERT';
  eventPlanPublishId = 'PLAN';
  eventUnpublishId = 'UNPUBLISH';

  formIsValid = false;

  get name() {
    return this._name;
  }

  constructor(private formToolbarService: FormToolbarService,
              private dialog: MatDialog,
              private sessionStore: SessionStore,
              private modalService: ModalService,
              private messageService: MessageService,
              private treeQuery: TreeQuery,
              private addressTreeQuery: AddressTreeQuery,
              private formStateService: FormStateService,
              private storageService: DocumentService) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    console.log('register publish plugin');
    // add button to toolbar for publish action
    this.formToolbarService.addButton({id: 'toolBtnPublishSeparator', isSeparator: true, pos: 100});

    this.formToolbarService.addButton({
      id: 'toolBtnPublish', label: 'Veröffentlichen',
      eventId: this.eventPublishId, pos: 25, align: 'right', active: false, isPrimary: true,
      menu: [
        {
          eventId: this.eventPlanPublishId,
          label: 'Planen',
          active: false,
        }, {
          eventId: this.eventRevertId,
          label: 'Auf letzte Veröffentlichung zurücksetzen',
          active: true,
        }, {
          eventId: this.eventUnpublishId,
          label: 'Veröffentlichung zurückziehen',
          active: false,
        },
        ]
    });

    // add event handler for revert
    const toolbarEventSubscription = this.formToolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'REVERT') {
        this.revert();
      } else if (eventId === 'PUBLISH') {
        this.publish();
      }
    });

    // add behaviour to set active states for toolbar buttons
    const behaviourSubscription = this.addBehaviour();

    this.subscriptions.push(toolbarEventSubscription, behaviourSubscription);
  }

  publish() {
    this.storageService.publishState$.next(true);
    const formIsValid = this.formStateService.getForm().valid;

    if (formIsValid) {
      // show confirm dialog
      const message = 'Wollen Sie diesen Datensatz wirklich veröffentlichen?';
      this.dialog.open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: 'Veröffentlichen',
          message,
          buttons: [
            {text: 'Abbrechen'},
            {text: 'Veröffentlichen', id: 'confirm', emphasize: true, alignRight: true}
          ]
        },
        maxWidth: 700
      }).afterClosed().subscribe(doPublish => {
        if (doPublish) {
          this.publishWithData(this.getFormValue());
        }
      });
    } else {
      const errors = this.calculateErrors(this.getForm().controls).join(',');
      console.warn('Invalid fields:', errors);
      this.modalService.showJavascriptError('Es müssen alle Felder korrekt ausgefüllt werden.');
    }
  }

  private calculateErrors(controls: { [p: string]: AbstractControl }) {
    return Object.keys(controls)
      .filter(key => controls[key].invalid);
  }

  private publishWithData(data) {
    this.storageService.publish(data, this.forAddress)
      .then(() => this.messageService.sendInfo('Das Dokument wurde veröffentlicht.'))
      .catch(error => this.handleSaveError(error));
  }

  private getFormValue(): IgeDocument {
    const form = this.getForm();
    return form?.value;
  }

  private getForm(): FormGroup {
    return this.formStateService.getForm();
  }

  revert() {
    const doc = this.getFormValue();

    const message = 'Wollen Sie diesen Datensatz wirklich auf die letzte Veröffentlichungsversion zurücksetzen?';
    this.dialog.open(ConfirmDialogComponent, {
      data: <ConfirmDialogData>{
        title: 'Zurücksetzen',
        message,
        buttons: [
          {text: 'Abbrechen'},
          {text: 'Zurücksetzen', id: 'revert', emphasize: true, alignRight: true}
        ]
      },
      maxWidth: 700
    }).afterClosed().subscribe(doRevert => {
      if (doRevert) {
        this.storageService.revert(doc._id, this.forAddress).subscribe(
          () => {
          },
          err => {
            console.log('Error when reverting data', err);
            throw(err);
          });
      }
    });
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton('toolBtnPublishSeparator');
    this.formToolbarService.removeButton('toolBtnPublish');
  }

  /**
   * When a dataset is loaded or changed then notify the toolbar to enable/disable button state.
   */
  private addBehaviour(): Subscription {
    return merge(
      this.treeQuery.openedDocument$,
      this.addressTreeQuery.openedDocument$
    ).subscribe(loadedDocument => {
      this.formToolbarService.setButtonState('toolBtnPublish', loadedDocument !== null && loadedDocument._type !== 'FOLDER' && loadedDocument.hasWritePermission);
      this.formToolbarService.setMenuItemStateOfButton('toolBtnPublish', this.eventRevertId,loadedDocument !== null && loadedDocument._state === 'PW');
    });

  }

  // TODO: refactor in base class to prevent duplicate code (see save.plugin.ts)
  /**
   * Handle version conflict errors during save
   *
   * @param error
   * @private
   */
  private handleSaveError(error: HttpErrorResponse) {
    if (error?.error?.errorCode === 'VERSION_CONFLICT') {
      this.dialog.open(VersionConflictDialogComponent).afterClosed()
        .subscribe(choice => this.handleAfterConflictChoice(choice, error.error));
    } else if (error?.status === 400 && error?.error.errorCode === 'VALIDATION_ERROR') {
      this.sessionStore.update({
        serverValidationErrors: ServerValidation.prepareServerValidationErrors(error.error.data)
      });
      this.dialog.open(ErrorDialogComponent, {
        data: new IgeError({
          message: 'Beim Veröffentlichen wurden Fehler im Formular entdeckt'
          // error: {message: ServerValidation.prepareServerError(error?.error)}
        })
      });
    } else {
      throw error;
    }
  }

  private handleAfterConflictChoice(choice: VersionConflictChoice, latestVersion: number) {
    switch (choice) {
      case 'cancel':
        break;
      case 'force':
        const formData = this.getFormDataWithVersionInfo(latestVersion);
        this.publishWithData(formData);
        break;
      case 'reload':
        this.storageService.reload$.next(this.getIdFromFormData());
        break;

    }
  }

  private getFormDataWithVersionInfo(version: number) {
    const data = this.getFormValue();
    data['_version'] = version;
    return data;
  }

  private getIdFromFormData() {
    return this.getFormValue()['_id'];
  }
}
