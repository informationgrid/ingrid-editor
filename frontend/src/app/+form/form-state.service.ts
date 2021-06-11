import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class FormStateService {
  private form: FormGroup;

  updateForm(form: FormGroup) {
    this.form = form;
  }

  getForm() {
    return this.form;
  }
}
