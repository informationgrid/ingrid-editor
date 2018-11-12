import { Injectable } from '@angular/core';
import { FormToolbarService } from '../../../+form/toolbar/form-toolbar.service';
import { FormularService } from '../../../services/formular/formular.service';
import { ModalService } from '../../../services/modal/modal.service';
import { DocumentService } from '../../../services/document/document.service';
import { Plugin } from '../../plugin';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/index';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UndoPlugin extends Plugin {
  id = 'plugin.undo';
  _name = 'Undo Plugin';

  eventUndoId = 'UNDO';
  eventRedoId = 'REDO';

  form: FormGroup;
  private history: any[] = [];
  private redoHistory: any[] = [];
  private actionTriggered = false;

  formValueSubscription: Subscription;

  get name() {
    return this._name;
  }

  constructor(private formToolbarService: FormToolbarService,
              private formService: FormularService,
              private modalService: ModalService,
              private storageService: DocumentService) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    this.formToolbarService.addButton( {id: 'toolBtnUndoSeparator',  isSeparator: true, pos: 140 } );

    // add button to toolbar for revert action
    this.formToolbarService.addButton({
      id: 'toolBtnUndo',
      tooltip: 'Undo',
      cssClasses: 'undo',
      eventId: this.eventUndoId,
      pos: 150,
      active: false
    });

    // add button to toolbar for revert action
    this.formToolbarService.addButton({
      id: 'toolBtnRedo',
      tooltip: 'Redo',
      cssClasses: 'redo',
      eventId: this.eventRedoId,
      pos: 160,
      active: false
    });

    // add event handler for revert
    this.formToolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === this.eventUndoId) {
        this.undo();
      } else if (eventId === this.eventRedoId) {
        this.redo();
      }
    });

    this.storageService.afterLoadAndSet.subscribe((data) => {
      if (data) {
        this.history = [];
        this.redoHistory = [];
        // this.actionTriggered = true;

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

  private undo() {
    this.actionTriggered = true;

    // ignore the last value, which is the current value
    this.redoHistory.push( this.history.pop() );

    // get the value before the current
    const recentValue = this.history.pop();

    this.form.setValue(recentValue);

    // deactivate undo button if history only contains the initial document
    if (this.history.length < 2) {
      this.formToolbarService.setButtonState('toolBtnUndo', false);
    }

    // enable redo button
    this.formToolbarService.setButtonState('toolBtnRedo', true);

  }

  private redo() {
    this.actionTriggered = true;

    const updatedValue = this.redoHistory.pop();

    this.form.setValue(updatedValue);

    if (this.redoHistory.length === 0) {
      this.formToolbarService.setButtonState('toolBtnRedo', false);
    }

    // FIXME: problem when undo/redo is happening too fast since debounce time will register change less often
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
      .pipe(
        debounceTime(500)
      )
      .subscribe((value) => {
        console.log('The form value changed:', value);

        // if we used the undo/redo button then ignore this event
        if (this.actionTriggered) {
          this.actionTriggered = false;
          // return;
        }

        // only push if other field was changed, otherwise remove last change and push new value
        // => so we only remember complete field changes instead of each character
        this.history.push(value);
        if (this.history.length > 1) {
          this.formToolbarService.setButtonState('toolBtnUndo', true);
        }
      });
  }
}
