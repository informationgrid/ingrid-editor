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
    return this.addTable("geometryContext", "Geometry-Kontext", {
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
