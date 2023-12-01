import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { GeoDatasetDoctype } from "../../ingrid/doctypes/geo-dataset.doctype";

@Injectable({
  providedIn: "root",
})
export class GeoDatasetDoctypeUPSH extends GeoDatasetDoctype {
  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    const section = fieldConfig.find(
      (field) => field.props.label === "Fachbezug",
    );
    const insertPosition = section.fieldGroup.findIndex(
      (field) => field.key === "vectorSpatialRepresentation",
    );
    section.fieldGroup.splice(
      insertPosition + 1,
      0,
      this.getGeometryContextFieldConfig(),
    );

    return fieldConfig;
  };

  private getGeometryContextFieldConfig(): FormlyFieldConfig {
    let featureTypeColumn = {
      label: "Feature-Typ",
      ...this.addSelectInline("featureType", "Feature-Typ", {
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
            fieldLabel: "Geometrie-Typ",
            required: true,
          }),
        },
        {
          label: "Name",
          ...this.addInput("name", "Name", {
            fieldLabel: "Name",
            required: true,
          }),
        },
        featureTypeColumn,
        {
          label: "Daten-Typ/-Klasse",
          ...this.addInput("dataType", "Daten-Typ/-Klasse", {
            fieldLabel: "Daten-Typ/-Klasse",
            required: true,
          }),
        },
        {
          label: "Beschreibung",
          ...this.addInput("description", "Beschreibung", {
            fieldLabel: "Beschreibung",
            required: true,
          }),
        },
        /*TODO: special values from import!?*/
        /*
         * {field: 'min', hidden: true},
         * {field: 'max', hidden: true},
         * {field: 'unit', hidden: true},
         * {field: 'attributes', hidden: true}
         */
      ],
    });
  }
}
