import {Injectable} from '@angular/core';
import {FormToolbarService} from '../../form-shared/toolbar/form-toolbar.service';
import {ModalService} from '../../../services/modal/modal.service';
import {DocumentService} from '../../../services/document/document.service';
import {Plugin} from '../../../+behaviours/plugin';
import {TreeQuery} from '../../../store/tree/tree.query';
import {AkitaNgFormsManager} from '@datorama/akita-ng-forms-manager';
import {MessageService} from '../../../services/message.service';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {merge} from 'rxjs';

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
              private modalService: ModalService,
              private messageService: MessageService,
              private treeQuery: TreeQuery,
              private addressTreeQuery: AddressTreeQuery,
              private formsManager: AkitaNgFormsManager,
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
      id: 'toolBtnRevert', tooltip: 'Auf letzte Veröffentlichung zurücksetzen', matSvgVariable: 'Aenderungen-verwerfen', eventId: this.eventRevertId, pos: 90, active: false
    });

    // add event handler for revert
    this.formToolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'REVERT') {
        this.revert();
      } else if (eventId === 'PUBLISH') {
        this.publish();
      }
    });

    this.formsManager.selectValid('document').subscribe(value => {
      this.formIsValid = value;
    });

    // add behaviour to set active states for toolbar buttons
    this.addBehaviour();

  }

  publish() {
    this.storageService.publishState$.next(true);

    if (this.formIsValid) {
      // show confirm dialog
      const message = 'Wollen Sie diesen Datensatz wirklich veröffentlichen?';
      this.modalService.confirm('Veröffentlichen', message).subscribe(doPublish => {
        if (doPublish) {
          this.storageService.publish(this.formsManager.getForm('document').value)
            .then(() => this.messageService.sendInfo('Das Dokument wurde veröffentlicht.'));
        }
      });
    } else {
      this.modalService.showJavascriptError('Es müssen alle Felder korrekt ausgefüllt werden.');
    }
  }

  revert() {
    const doc = this.formsManager.getForm('document').value;

    const message = 'Wollen Sie diesen Datensatz wirklich auf die letzte Veröffentlichungsversion zurücksetzen?';
    this.modalService.confirm('Zurücksetzen', message).subscribe(doRevert => {
      if (doRevert) {
        this.storageService.revert(doc._id).subscribe(
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
  private addBehaviour() {
    merge(
      this.treeQuery.openedDocument$,
      this.addressTreeQuery.openedDocument$
    ).subscribe(loadedDocument => {
      this.formToolbarService.setButtonState('toolBtnPublish', loadedDocument !== null && loadedDocument._profile !== 'FOLDER');
      this.formToolbarService.setButtonState('toolBtnRevert', loadedDocument !== null && loadedDocument._state === 'PW');
    });

  }
}
