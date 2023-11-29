import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { GeoDatasetDoctype } from "../../ingrid/doctypes/geo-dataset.doctype";

@Injectable({
  providedIn: "root",
})
export class GeoDatasetDoctypeKrzn extends GeoDatasetDoctype {
  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    // add "Produktionsumgebung"
    fieldConfig
      .find((field) => field.props.label === "Fachbezug")
      .fieldGroup.push(this.getEnvironmentDescriptionFieldConfig());

    // add map link field
    fieldConfig
      .find((field) => field.props.label === "Raumbezug")
      .fieldGroup.push(this.getMapLinkFieldConfig());

    return fieldConfig;
  };

  private getEnvironmentDescriptionFieldConfig(): FormlyFieldConfig {
    return this.addInput("environmentDescription", "Produktionsumgebung", {
      wrappers: ["panel", "form-field"],
    });
  }

  private getMapLinkFieldConfig() {
    return this.addSelect("mapLink", "Alternativer Karten Client", {
      className: "optional",
      allowNoValue: true,
      noValueLabel: "keine Daten im Geoportal",
      placeholder: "keine Daten im Geoportal",
      options: this.getCodelistForSelect(10500, "mapLink"),
    });
  }
}
