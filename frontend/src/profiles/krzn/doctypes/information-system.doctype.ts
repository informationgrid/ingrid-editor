import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { InformationSystemDoctype } from "../../ingrid/doctypes/information-system.doctype";

@Injectable({
  providedIn: "root",
})
export class InformationSystemDoctypeKrzn extends InformationSystemDoctype {
  id = "InGridInformationSystemKrzn";
  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    fieldConfig
      .find((field) => field.props.label === "Fachbezug")
      .fieldGroup.push(this.getEnvironmentDescriptionFieldConfig());
    return fieldConfig;
  };

  private getEnvironmentDescriptionFieldConfig(): FormlyFieldConfig {
    return this.addInput("environmentDescription", "Produktionsumgebung", {
      wrappers: ["panel", "form-field"],
    });
  }
}
