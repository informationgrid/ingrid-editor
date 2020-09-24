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
import {NgFormsManager} from '@ngneat/forms-manager';
import {HttpErrorResponse} from '@angular/common/http';
import {
  VersionConflictChoice,
  VersionConflictDialogComponent
} from '../version-conflict-dialog/version-conflict-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent, ConfirmDialogData} from '../../../dialogs/confirm/confirm-dialog.component';
import {ErrorDialogComponent} from '../../../dialogs/error/error-dialog.component';
import {IgeError} from '../../../models/ige-error';
import {SessionStore} from '../../../store/session.store';

@Injectable()
export class PublishPlugin extends Plugin {
  id = 'plugin.publish';
  _name = 'Publish Plugin';
  defaultActive = true;

  eventPublishId = 'PUBLISH';
  eventRevertId = 'REVERT';

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
              private formsManager: NgFormsManager,
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
      eventId: this.eventPublishId, pos: 25, align: 'right', active: false, isPrimary: true
    });

    // add button to toolbar for revert action
    this.formToolbarService.addButton({
      id: 'toolBtnRevert', tooltip: 'Auf letzte Veröffentlichung zurücksetzen', matSvgVariable: 'Aenderungen-verwerfen',
      eventId: this.eventRevertId, pos: 90, active: true
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
    const formIsValid = this.formsManager.isValid(this.forAddress ? 'address' : 'document');

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
      this.modalService.showJavascriptError('Es müssen alle Felder korrekt ausgefüllt werden.');
    }
  }

  private publishWithData(data) {
    this.storageService.publish(data, this.forAddress)
      .then(() => this.messageService.sendInfo('Das Dokument wurde veröffentlicht.'))
      .catch(error => this.handleSaveError(error));
  }

  private getFormValue(): IgeDocument {
    const formDoc = this.forAddress ? 'address' : 'document';
    const form = this.formsManager.getControl(formDoc);
    return form?.value;
  }

  revert() {
    const doc = this.formsManager.getControl('document').value;

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
    this.formToolbarService.removeButton('toolBtnRevert');
  }

  /**
   * When a dataset is loaded or changed then notify the toolbar to enable/disable button state.
   */
  private addBehaviour(): Subscription {
    return merge(
      this.treeQuery.openedDocument$,
      this.addressTreeQuery.openedDocument$
    ).subscribe(loadedDocument => {
      this.formToolbarService.setButtonState('toolBtnPublish', loadedDocument !== null && loadedDocument._type !== 'FOLDER');
      this.formToolbarService.setButtonState('toolBtnRevert', loadedDocument !== null && loadedDocument._state === 'PW');
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
    if (error?.error?.ErrorCode === 'VERSION_CONFLICT') {
      this.dialog.open(VersionConflictDialogComponent).afterClosed()
        .subscribe(choice => this.handleAfterConflictChoice(choice, error.error));
    } else if (error?.status === 404 && error?.error.ErrorCode === 'PUBLISHED_VERSION_NOT_FOUND') {
      this.sessionStore.update({
        serverValidationErrors: [
          {
            key: 'addresses',
            messages: [{'noPublishedRefs': {message: error.error.ErrorText}}]
          }
        ]
      });
      this.dialog.open(ErrorDialogComponent, {
        data: new IgeError({
          message: 'Beim Veröffentlichen wurden Fehler im Formular entdeckt',
          error: {message: error?.error?.ErrorText}
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
