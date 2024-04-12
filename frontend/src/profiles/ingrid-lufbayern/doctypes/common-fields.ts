import { Injectable } from "@angular/core";
import { FormFieldHelper } from "../../form-field-helper";
import { FormlyFieldConfig } from "@ngx-formly/core";

@Injectable({ providedIn: "root" })
export class CommonFieldsLfuBayern extends FormFieldHelper {
  getGeodataFieldConfig(): FormlyFieldConfig {
    return this.addInput("dataSetURI", "Geodatenlink", {
      wrappers: ["panel", "form-field"],
    });
  }
  getFeesFieldConfig(): FormlyFieldConfig {
    return this.addTextArea("fees", "Gebühren", "lfub");
  }
  getSupplementFieldConfig(): FormlyFieldConfig {
    return this.addInput("supplementalInformation", "Interne Bemerkungen", {
      wrappers: ["panel", "form-field"],
    });
  }
  getUseConstraintsCommentFieldConfig(): FormlyFieldConfig {
    return this.addTextArea(
      "useConstraintsComments",
      "Kommentar (Nutzungsbedingungen)",
      "lfub",
    );
  }
  getInternalKeywordsFieldConfig(): FormlyFieldConfig {
    return this.addRepeatList("internalKeywords", "Interne Schlüsselwörter", {
      view: "chip",
    });
  }
  getGeologicalKeywordsFieldConfig(): FormlyFieldConfig {
    return this.addRepeatList(
      "geologicalKeywords",
      "Geologische Schlüsselliste",
      {
        view: "chip",
      },
    );
  }
}
