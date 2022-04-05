import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class FormStateService {
  private form: FormGroup;
  private textareaElementsHeights: any[] = [];

  updateForm(form: FormGroup) {
    this.form = form;
  }

  getForm() {
    return this.form;
  }

  setTextareaElementsHeights(Heights) {
    this.textareaElementsHeights = Heights;
  }

  getTextareaElements(selector: string) {
    let textareaElements = document.querySelectorAll(selector);
    return textareaElements;
  }

  // save current height of all textareas of current document type from the DOM
  storeTextareaElementsHeights(selector: string) {
    // get and store textareaElements heights
    let textareaElements = this.getTextareaElements(selector);
    textareaElements.forEach((textarea: HTMLElement) => {
      this.textareaElementsHeights[textarea.id] = textarea.style.height;
    });
  }

  // restore height of all textareas if found in memory for the new document type
  restoreTextareaElementsHeights(selector: string) {
    setTimeout(() => {
      let textareaElements = this.getTextareaElements(selector);
      textareaElements.forEach((textarea: HTMLElement) => {
        if (this.textareaElementsHeights[textarea.id] != undefined) {
          textarea.style.height = this.textareaElementsHeights[textarea.id];
        }
      });
    }, 100);
  }
}
