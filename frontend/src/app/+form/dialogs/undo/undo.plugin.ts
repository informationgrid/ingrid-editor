import { inject, Injectable } from "@angular/core";
import { FormToolbarService } from "../../form-shared/toolbar/form-toolbar.service";
import { UntypedFormGroup } from "@angular/forms";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { Plugin } from "../../../+catalog/+behaviours/plugin";
import { PluginService } from "../../../services/plugin/plugin.service";

@Injectable()
export class UndoPlugin extends Plugin {
  id = "plugin.undo";
  name = "Undo Plugin";
  description =
    "Hiermit können die letzten Änderungen im Dokument rückgängig gemacht werden.";
  group = "Toolbar";
  defaultActive = true;

  eventUndoId = "UNDO";
  eventRedoId = "REDO";

  form: UntypedFormGroup;
  private history: any[] = [];
  private redoHistory: any[] = [];
  private actionTriggered = false;

  constructor(
    private formToolbarService: FormToolbarService,
    private docEvents: DocEventsService,
  ) {
    super();
    inject(PluginService).registerPlugin(this);
  }

  register() {
    super.register();

    this.addToolbarButtons();

    // add event handler for revert
    const toolbarEventSubscription = [
      this.docEvents.onEvent(this.eventUndoId).subscribe(() => this.undo()),
      this.docEvents.onEvent(this.eventRedoId).subscribe(() => this.redo()),
    ];

    /*const afterLoadSubscription = this.docEvents
      .afterLoadAndSet$(this.forAddress)
      .subscribe((data) => {
        // if (data) {
        this.history = [];
        this.redoHistory = [];
        // this.actionTriggered = true;

        this.formToolbarService.setButtonState("toolBtnUndo", false);

        // add behaviour to set active states for toolbar buttons
        // need to add behaviour after each load since form-object changes!

        // FIXME: form is not available when opening a document, going to dashboard and back to form again
        //        seems to be, because when clicking on form, the last opened document is being reloaded!?
        this.addBehaviour();

        this.subscriptions.push(
          toolbarEventSubscription,
          afterLoadSubscription
        );
        // }
      });*/
    this.subscriptions.push(...toolbarEventSubscription);
  }

  private addToolbarButtons() {
    this.formToolbarService.addButton({
      id: "toolBtnUndoSeparator",
      isSeparator: true,
      pos: 140,
    });

    // add button to toolbar for revert action
    this.formToolbarService.addButton({
      id: "toolBtnUndo",
      tooltip: "Undo",
      matIconVariable: "undo",
      eventId: this.eventUndoId,
      pos: 150,
      active: false,
    });

    // add button to toolbar for revert action
    this.formToolbarService.addButton({
      id: "toolBtnRedo",
      tooltip: "Redo",
      matIconVariable: "redo",
      eventId: this.eventRedoId,
      pos: 160,
      active: false,
    });
  }

  private undo() {
    this.actionTriggered = true;

    // ignore the last value, which is the current value
    this.redoHistory.push(this.history.pop());

    // get the value before the current
    const recentValue = this.history.pop();

    this.form.setValue(recentValue);

    // deactivate undo button if history only contains the initial document
    if (this.history.length < 2) {
      this.formToolbarService.setButtonState("toolBtnUndo", false);
    }

    // enable redo button
    this.formToolbarService.setButtonState("toolBtnRedo", true);
  }

  private redo() {
    this.actionTriggered = true;

    const updatedValue = this.redoHistory.pop();

    this.form.setValue(updatedValue);

    if (this.redoHistory.length === 0) {
      this.formToolbarService.setButtonState("toolBtnRedo", false);
    }

    // FIXME: problem when undo/redo is happening too fast since debounce time will register change less often
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton("toolBtnUndoSeparator");
    this.formToolbarService.removeButton("toolBtnUndo");
    this.formToolbarService.removeButton("toolBtnRedo");
  }

  /**
   * When a dataset is loaded or changed then notify the toolbar to enable/disable button state.
   */
  /*
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
  */
}
