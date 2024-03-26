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
