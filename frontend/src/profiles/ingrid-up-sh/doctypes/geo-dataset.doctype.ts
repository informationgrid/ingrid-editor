import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { GeoDatasetDoctype } from "../../ingrid/doctypes/geo-dataset.doctype";

@Injectable({
  providedIn: "root",
})
export class GeoDatasetDoctypeUPSH extends GeoDatasetDoctype {
  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    // add "Produktionsumgebung"
    fieldConfig
      .find((field) => field.props.label === "Fachbezug")
      .fieldGroup.push(this.getGeometryContextFieldConfig());

    return fieldConfig;
  };

  private getGeometryContextFieldConfig(): FormlyFieldConfig {
    return this.addRepeatDetailList("geometryContext", "Geometry Context", {
      className: "label-width-xl",
      fields: [
        this.addInput("geometryType", "Geometrie-Typ", {
          wrappers: ["panel", "form-field"],
        }),
        this.addInput("name", "Name", {
          wrappers: ["panel", "form-field"],
        }),
        this.addSelect("featureType", "Feature-Typ", {
          options: [
            { label: "nominal", value: "nominal" },
            { label: "ordinal", value: "ordinal" },
            { label: "skalar", value: "scalar" },
            { label: "sonstiges", value: "other" },
          ],
        }),
        this.addInput("dataType", "Daten-Typ/-Klasse", {
          wrappers: ["panel", "form-field"],
        }),
        this.addInput("description", "Beschreibung", {
          wrappers: ["panel", "form-field"],
        }),
      ],
      titleField: "name",
    });
  }
}
