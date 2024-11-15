/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { inject, Injectable, signal } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { transaction } from "@datorama/akita";
import { Metadata } from "../models/ige-document";
import { UiStore } from "../store/ui.store";

@Injectable({
  providedIn: "root",
})
export class FormStateService {
  private uiStore = inject(UiStore);
  private form: UntypedFormGroup;
  private _metadata = signal<Metadata>(null);
  metadata = this._metadata.asReadonly();
  private textareaElementsRows = this.uiStore.textAreaHeights;
  private readonly lineHeight = 24;

  private resizeObserver = new ResizeObserver((entries) =>
    this.storeTextareaElementsHeight(entries),
  );

  updateForm(form: UntypedFormGroup) {
    this.form = form;
  }

  updateMetadata(metadata: Metadata) {
    this._metadata.set(metadata);
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
      this.resizeObserver.unobserve(element),
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
        this.uiStore.setTextAreaHeights(rows <= 3 ? undefined : rows);
      }
    });
  }

  private observeTextareaHeights() {
    setTimeout(() => {
      FormStateService.getTextareaElements().forEach((element) =>
        this.resizeObserver.observe(element),
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
