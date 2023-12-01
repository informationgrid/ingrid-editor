import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { GeoDatasetDoctype } from "../../ingrid/doctypes/geo-dataset.doctype";
import { GeometryContextDialogComponent } from "../dialogs/geometry-context-dialog.component";

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
    return this.addTable("geometryContext", "Geometry Context", {
      supportUpload: false,
      dialog: GeometryContextDialogComponent,
      columns: [
        {
          key: "geometryType",
          label: "Geometrie-Typ",
          props: { required: true },
        },
        {
          key: "name",
          label: "Name",
          props: { required: true },
        },
        {
          key: "featureType",
          label: "Feature-Typ",
          props: {
            required: true,
            formatter: (item: any) =>
              GeometryContextDialogComponent.featureTypeOptions.find(
                (option) => option.value === item.key,
              )?.label ?? item.key,
          },
        },
        {
          key: "dataType",
          label: "Daten-Typ/-Klasse",
          props: { required: true },
        },
        {
          key: "description",
          label: "Beschreibung",
          props: { required: true },
        },
        {
          key: "min",
          hidden: true,
        },
      ],
    });
  }
}
