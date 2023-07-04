import { Injectable } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { SessionStore } from "../store/session.store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { transaction } from "@datorama/akita";

@Injectable({
  providedIn: "root",
})
export class FormStateService {
  private form: UntypedFormGroup;
  private textareaElementsRows: any = {};
  private readonly lineHeight = 24;

  private resizeObserver = new ResizeObserver((entries) =>
    this.storeTextareaElementsHeight(entries)
  );

  constructor(private sessionStore: SessionStore) {
    // get text area height state from browser store
    this.textareaElementsRows = {
      ...this.sessionStore.getValue().ui.textAreaHeights,
    };
  }

  updateForm(form: UntypedFormGroup) {
    this.form = form;
  }

  getForm() {
    return this.form;
  }

  // restore height of all textareas if found in memory for the new document type
  restoreAndObserveTextareaHeights(fields: FormlyFieldConfig[]) {
    this.restoreTextAreaHeigths(fields);
    this.observeTextareaHeights();
  }

  unobserveTextareaHeights() {
    FormStateService.getTextareaElements().forEach((element) =>
      this.resizeObserver.unobserve(element)
    );
  }

  // save current height of all textareas of current document type from the DOM
  @transaction()
  private storeTextareaElementsHeight(entries: ResizeObserverEntry[]) {
    entries.forEach((entry) => {
      // get and store textareaElements heights
      let height = (<HTMLTextAreaElement>entry.target).offsetHeight;
      let styleHeight = (<HTMLTextAreaElement>entry.target).style.height;
      if (styleHeight !== "") {
        const rows = Math.round(height / this.lineHeight);
        this.textareaElementsRows[entry.target.id] =
          rows <= 3 ? undefined : rows;

        this.sessionStore.update((state) => ({
          ui: {
            ...state.ui,
            textAreaHeights: this.textareaElementsRows,
          },
        }));
      }
    });
  }

  private observeTextareaHeights() {
    setTimeout(() => {
      FormStateService.getTextareaElements().forEach((element) =>
        this.resizeObserver.observe(element)
      );
    }, 500);
  }

  private restoreTextAreaHeigths(fields: FormlyFieldConfig[]) {
    fields.forEach((field) => {
      if (field.fieldGroup) {
        this.restoreTextAreaHeigths(field.fieldGroup);
        return;
      }

      if (
        field.type === "textarea" &&
        this.textareaElementsRows[field.id] !== undefined
      ) {
        field.props.rows = this.textareaElementsRows[field.id];
      }
    });
  }

  private static getTextareaElements(): NodeListOf<HTMLTextAreaElement> {
    return document.querySelectorAll("form formly-field-mat-textarea textarea");
  }
}
