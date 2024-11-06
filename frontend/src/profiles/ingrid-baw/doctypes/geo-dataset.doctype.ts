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
import { inject, Injectable } from "@angular/core";
import { GeoDatasetDoctype } from "../../ingrid/doctypes/geo-dataset.doctype";
import { CommonFieldsBaw } from "./common-fields";

@Injectable({
  providedIn: "root",
})
export class GeoDatasetDoctypeBaw extends GeoDatasetDoctype {
  common = inject(CommonFieldsBaw);

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    this.common.addSharedFields(this, fieldConfig);

    const pointOfContactPosition = this.common.findFieldElementWithId(
      fieldConfig,
      "pointOfContact",
    );

    // Auftragsnummer
    this.common.addAfter(
      pointOfContactPosition,
      this.common.getOrderNumberFieldConfig(),
    );
    // Auftragstitel
    this.common.addAfter(
      pointOfContactPosition,
      this.common.getOrderTitleFieldConfig(),
    );

    // Simulation
    const simulationSection = fieldConfig.find(
      (field) => field.props.label === "Fachbezug",
    ).fieldGroup;
    simulationSection.unshift(this.getPlaceholderFieldConfig());
    simulationSection.unshift(this.getFrequencyFieldConfig());
    simulationSection.unshift(this.getTimestepFieldConfig());
    simulationSection.unshift(this.getDimensionalityFieldConfig());
    simulationSection.unshift(this.getSimulationFieldConfig());

    return fieldConfig;
  };

  getSimulationFieldConfig(): FormlyFieldConfig {
    return this.addSelect("process", "Simulationsverfahren", {
      options: this.getCodelistForSelect("3950001", "null"),
    });
  }

  getDimensionalityFieldConfig(): FormlyFieldConfig {
    return this.addSelect("dimensionality", "Räumliche Dimensionalität", {
      options: this.getCodelistForSelect("3950000", "null"),
    });
  }

  getFrequencyFieldConfig(): FormlyFieldConfig {
    return this.addInput("frequency", "Frequenz der Messung", {
      fieldLabel: "Frequenz der Messung",
      type: "number",
      suffix: {
        text: "s",
      },
    });
  }

  getTimestepFieldConfig(): FormlyFieldConfig {
    return this.addInput("timestep", "Zeitliche Genauigkeit (zurückgestellt)", {
      fieldLabel: "Zeitliche Genauigkeit",
      type: "number",
      suffix: {
        text: "s",
      },
    });
  }
  getPlaceholderFieldConfig(): FormlyFieldConfig {
    return this.addSelect(
      "simulationPlaceholder",
      "Platzhalter Simulationsparameter/-Größen name rolle wert maß messparameter  (zurückgestellt)",
      {
        options: this.getCodelistForSelect("3950000", "null"),
      },
    );
  }
}
