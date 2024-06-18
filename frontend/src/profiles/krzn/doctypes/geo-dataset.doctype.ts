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

    // add geo-data link field
    fieldConfig
      .find((field) => field.props.label === "Verfügbarkeit")
      .fieldGroup.splice(2, 0, this.getGeoLinkFieldConfig());

    return fieldConfig;
  };

  private getEnvironmentDescriptionFieldConfig(): FormlyFieldConfig {
    return this.addInput("environmentDescription", "Produktionsumgebung", {
      wrappers: ["panel", "form-field"],
    });
  }

  private getMapLinkFieldConfig() {
    return this.addSelect("mapLink", "Alternativer Karten Client", {
      required: true,
      allowNoValue: false,
      options: this.getCodelistForSelect("10500", "mapLink", "value"),
    });
  }

  private getGeoLinkFieldConfig(): FormlyFieldConfig {
    return this.addInput("dataSetURI", "Geodatenlink", {
      wrappers: ["panel", "form-field"],
    });
  }
}
