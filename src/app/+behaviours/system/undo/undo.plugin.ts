import { Injectable } from '@angular/core';
import { FormToolbarService } from '../../../+form/toolbar/form-toolbar.service';
import { FormularService } from '../../../services/formular/formular.service';
import { ModalService } from '../../../services/modal/modal.service';
import { StorageService } from '../../../services/storage/storage.service';
import { Plugin } from '../../plugin';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/index';

@Injectable()
export class UndoPlugin extends Plugin {
  id = 'plugin.undo';
  _name = 'Undo Plugin';

  eventUndoId = 'UNDO';

  form: FormGroup;
  history: any[] = [];

  formValueSubscription: Subscription;

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

    // add button to toolbar for revert action
    this.formToolbarService.addButton({
      id: 'toolBtnUndo',
      tooltip: 'Undo',
      cssClasses: 'undo',
      eventId: this.eventUndoId,
      active: false
    });

    // add event handler for revert
    this.formToolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === this.eventUndoId) {
        this.undo();
      }
    });

    this.storageService.afterLoadAndSet.subscribe((data) => {
      if (data) {
        this.history = [];
        this.formToolbarService.setButtonState('toolBtnUndo', false);

        // remove old subscription
        if (this.formValueSubscription) {
          this.formValueSubscription.unsubscribe();
        }

        // add behaviour to set active states for toolbar buttons
        // need to add behaviour after each load since form-object changes!

        this.addBehaviour();
      }
    });

  }

  undo() {
    // ignore the last value, which is the current value
    this.history.pop();

    // get the value before the current
    const recentValue = this.history.pop();

    this.form.setValue(recentValue);

    if (this.history.length < 2) {
      this.formToolbarService.setButtonState('toolBtnUndo', false);
    }
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton('toolBtnUndo');

    if (this.formValueSubscription) {
      this.formValueSubscription.unsubscribe();
    }
  }

  /**
   * When a dataset is loaded or changed then notify the toolbar to enable/disable button state.
   */
  private addBehaviour() {
    const formData = this.formService.requestFormValues();

    this.form = formData.form;
    this.formValueSubscription = this.form.valueChanges
    // TODO: .debounceTime(500)
      .subscribe((value) => {
        console.log('The form value changed:', value);
        // only push if other field was changed, otherwise remove last change and push new value
        // => so we only remember complete field changes instead of each character
        this.history.push(value);
        if (this.history.length > 1) {
          this.formToolbarService.setButtonState('toolBtnUndo', true);
        }
      });
  }
}
