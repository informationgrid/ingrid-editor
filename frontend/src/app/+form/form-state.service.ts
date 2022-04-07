import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class FormStateService {
  private form: FormGroup;
  private textareaElementsHeights: any = {};

  updateForm(form: FormGroup) {
    this.form = form;
  }

  getForm() {
    return this.form;
  }

  getTextareaElements(selector: string) {
    let textareaElements = document.querySelectorAll(selector);
    return textareaElements;
  }

  // save current height of all textareas of current document type from the DOM
  storeTextareaElementsHeights() {
    // get and store textareaElements heights
    let textareaElements = this.getTextareaElements(
      "form formly-field-mat-textarea textarea"
    );
    textareaElements.forEach((textarea: HTMLElement) => {
      this.textareaElementsHeights[textarea.id] = textarea.style.height;
    });
  }

  // restore height of all textareas if found in memory for the new document type
  restoreTextareaElementsHeights() {
    setTimeout(() => {
      let textareaElements = this.getTextareaElements(
        "form formly-field-mat-textarea textarea"
      );
      textareaElements.forEach((textarea: HTMLElement) => {
        if (this.textareaElementsHeights[textarea.id] != undefined) {
          textarea.style.height = this.textareaElementsHeights[textarea.id];
        }
      });
    }, 100);
  }
}
