import {Injectable} from '@angular/core';
import {FormToolbarService} from '../../../+form/toolbar/form-toolbar.service';
import {ModalService} from '../../../services/modal/modal.service';
import {DocumentService} from '../../../services/document/document.service';
import {Plugin} from '../../plugin';
import {DocumentQuery} from "../../../store/document/document.query";
import {DocumentState} from "../../../models/ige-document";
import {TreeQuery} from '../../../store/tree/tree.query';
import {AkitaNgFormsManager} from '@datorama/akita-ng-forms-manager';
import {FormularService} from '../../../+form/formular.service';

@Injectable({
  providedIn: 'root'
})
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
              private formService: FormularService,
              private modalService: ModalService,
              private documentQuery: DocumentQuery,
              private treeQuery: TreeQuery,
              private formsManager: AkitaNgFormsManager,
              private storageService: DocumentService) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    console.log( 'register publish plugin' );
    // add button to toolbar for publish action
    this.formToolbarService.addButton( {id: 'toolBtnPublishSeparator',  isSeparator: true, pos: 100 } );

    this.formToolbarService.addButton( {
      id: 'toolBtnPublish', tooltip: 'Publish', label: 'Veröffentlichen', cssClasses: 'publish',
      eventId: this.eventPublishId, pos: 25, align: 'right', active: false, isPrimary: true
    } );

    // add button to toolbar for revert action
    this.formToolbarService.addButton( {
      id: 'toolBtnRevert', tooltip: 'Revert', cssClasses: 'backspace', eventId: this.eventRevertId, pos: 110, active: false
    } );

    // add event handler for revert
    this.formToolbarService.toolbarEvent$.subscribe( eventId => {
      if (eventId === 'REVERT') {
        this.revert();
      } else if (eventId === 'PUBLISH') {
        this.publish();
      }
    } );

    this.formsManager.selectValid('document').subscribe( value => {
      console.log('This form is: ' + value);
      this.formIsValid = value;
    });

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
    if (this.formIsValid) {
      this.storageService.publish(this.formsManager.getForm('document').value);
    } else {
      this.modalService.showJavascriptError('Es müssen alle Felder korrekt ausgefüllt werden.');
    }
  }

  revert() {
    // TODO: confirm before revert!

    const formData = this.formService.requestFormValues();
    this.storageService.revert(formData.value._id).subscribe(null, err => {
      console.log( 'Error when reverting data', err );
      throw(err);
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

    this.documentQuery.openedDocument$
    //TODO: .pipe(takeUntil(this.componentDestroyed))
      .subscribe(data => {
        this.formToolbarService.setButtonState( 'toolBtnPublish', data !== null );
        this.formToolbarService.setButtonState( 'toolBtnRevert', data !== null && data._state === DocumentState.PW );
      } );
  }
}
