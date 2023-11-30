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
    let featureTypeColumn = {
      label: "Feature-Typ",
      ...this.addSelect("featureType", "Feature-Typ", {
        required: true,
        options: [
          { label: "nominal", value: "nominal" },
          { label: "ordinal", value: "ordinal" },
          { label: "skalar", value: "scalar" },
          { label: "sonstiges", value: "other" },
        ],
      }),
    };
    featureTypeColumn.props.formatter = (item: any, x, y, columnDef: any) =>
      columnDef.props.options.find((option) => option.value === item.key)
        ?.label ?? item.key;

    return this.addTable("geometryContext", "Geometry Context", {
      supportUpload: false,
      columns: [
        {
          label: "Geometrie-Typ",
          ...this.addInput("geometryType", "Geometrie-Typ", {
            required: true,
            wrappers: ["panel", "form-field"],
          }),
        },
        {
          label: "Name",
          ...this.addInput("name", "Name", {
            required: true,
            wrappers: ["panel", "form-field"],
          }),
        },
        featureTypeColumn,
        {
          label: "Daten-Typ/-Klasse",
          ...this.addInput("dataType", "Daten-Typ/-Klasse", {
            required: true,
            wrappers: ["panel", "form-field"],
          }),
        },
        {
          label: "Beschreibung",
          ...this.addInput("description", "Beschreibung", {
            required: true,
            wrappers: ["panel", "form-field"],
          }),
        },
      ],
    });
  }
}
