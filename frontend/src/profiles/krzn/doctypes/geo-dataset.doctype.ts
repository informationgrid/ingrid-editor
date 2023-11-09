import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { GeoDatasetDoctype } from "../../ingrid/doctypes/geo-dataset.doctype";

@Injectable({
  providedIn: "root",
})
export class GeoDatasetDoctypeKrzn extends GeoDatasetDoctype {
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
