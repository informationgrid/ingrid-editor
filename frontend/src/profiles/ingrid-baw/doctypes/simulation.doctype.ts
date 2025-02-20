/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { GeoDatasetDoctypeBaw } from "./geo-dataset.doctype";

@Injectable({
  providedIn: "root",
})
export class SimulationDoctypeBaw extends GeoDatasetDoctypeBaw {
  id = "BawSimulation";

  label = "Simulation";

  iconClass = "Projekt";

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    this.common.addSharedGeoDatasetFields(this, fieldConfig);

    fieldConfig.push(
      this.addSection("Simulationsdaten", [
        this.getSimulationFieldConfig(),
        this.getDimensionalityFieldConfig(),
        this.common.getTimestepFieldConfig(),
        this.getSimulationModelTypeFieldConfig(),
        this.getSimulationParameterFieldConfig(),
      ]),
    );

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

  private getSimulationModelTypeFieldConfig() {
    return this.addRepeatList("simulationModelType", "Simulationsmodellart", {
      asSelect: true,
      options: this.getCodelistForSelect("3950003", "null"),
    });
  }

  private getSimulationParameterFieldConfig() {
    return this.addRepeat("simulationParameter", "Simulationsparameter", {
      fields: [
        this.addInputInline("name", "Name", { required: true }),
        this.addSelectInline("role", "Rolle", {
          required: true,
          options: this.getCodelistForSelect("3950004", "null"),
        }),
        this.addInputInline("value", "Wert/Wertebereich", {
          required: true,
        }),
        this.addInputInline("unit", "Maßeinheit", {
          required: true,
        }),
      ],
    });
  }
}
