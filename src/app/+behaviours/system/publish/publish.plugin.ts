import {Injectable} from '@angular/core';
import {FormToolbarService} from '../../../+form/toolbar/form-toolbar.service';
import {FormularService} from '../../../services/formular/formular.service';
import {ModalService} from '../../../services/modal/modal.service';
import {StorageService} from '../../../services/storage/storage.service';
import {Plugin} from '../../plugin';

@Injectable()
export class PublishPlugin extends Plugin {
  id = 'plugin.publish';
  _name = 'Publish Plugin';

  eventPublishId = 'PUBLISH';
  eventRevertId = 'REVERT';

  get name() {
    return this._name;
  }

  constructor(private formToolbarService: FormToolbarService,
              private formService: FormularService,
              private modalService: ModalService,
              private storageService: StorageService) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    console.log( 'register publish plugin' );
    // add button to toolbar for publish action
    this.formToolbarService.addButton( {id: 'toolBtnPublishSeparator',  isSeparator: true } );

    this.formToolbarService.addButton( {
      id: 'toolBtnPublish', tooltip: 'Publish', cssClasses: 'fa fa-caret-square-o-right', eventId: this.eventPublishId, active: false
    } );

    // add button to toolbar for revert action
    this.formToolbarService.addButton( {
      id: 'toolBtnRevert', tooltip: 'Revert', cssClasses: 'fa fa-step-backward', eventId: this.eventRevertId, active: false
    } );

    // add event handler for revert
    this.formToolbarService.toolbarEvent$.subscribe( eventId => {
      if (eventId === 'REVERT') {
        this.revert();
      } else if (eventId === 'PUBLISH') {
        this.publish();
      }
    } );

    // add behaviour to set active states for toolbar buttons
    this.addBehaviour();

    // add action for button
    // -> add field to document tagging publish state

    // how to display document that it is published or not?
    // -> tree, symbol in formular, which works in all kinds of formulars
    // -> or make view flexible which can be overridden

    // add hook to attach to when action is triggered
  }

  publish() {
    const formData = this.formService.requestFormValues();
    // let errors: any = {errors: []};
    // this.storageService.beforeSave.next(errors);

    if (formData.form.invalid) {
      this.modalService.showError('Es müssen alle Felder korrekt ausgefüllt werden.');
    } else {
      this.storageService.publish(formData.value);
    }
  }

  revert() {
    // TODO: confirm before revert!

    const formData = this.formService.requestFormValues();
    this.storageService.revert(formData.value._id).subscribe(null, err => {
      console.log( 'Error when reverting data', err );
      this.modalService.showError(err.text());
    });
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton('toolBtnPublishSeparator');
    this.formToolbarService.removeButton('toolBtnPublish');
    this.formToolbarService.removeButton('toolBtnRevert');
  }

  /**
   * Depending on the state of a dataset set the toolbar button state.
   * @param data
   */
  private handleRevertButtonState(data: any) {
    let revertButtonActive = false;
    if (data._state === 'PW') {
      revertButtonActive = true;
    }

    this.formToolbarService.setButtonState('toolBtnRevert', revertButtonActive);
  }

  /**
   * When a dataset is loaded or changed then notify the toolbar to enable/disable button state.
   */
  private addBehaviour() {
    this.storageService.datasetsChanged$.subscribe( (data) => {
      this.handleRevertButtonState(data);
    });

    this.storageService.afterLoadAndSet$.subscribe( (data) => {
      if (data) {
        this.handleRevertButtonState(data);
      }
    });

    this.formService.selectedDocuments$.subscribe( data => {
      this.formToolbarService.setButtonState( 'toolBtnPublish', data.length === 1 );
      this.formToolbarService.setButtonState( 'toolBtnRevert', data.length === 1 );
    } );
  }
}
