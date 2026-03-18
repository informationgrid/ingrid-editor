/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { isNotEmptyObject } from "../../../app/shared/utils";

@Injectable({
  providedIn: "root",
})
export class SimulationDoctypeBaw extends GeoDatasetDoctypeBaw {
  id = "BawSimulation";

  label = "Simulation";

  iconClass = "simulationsdaten";

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
      {
        key: "simulationPhases",
        type: "bawPhases",
        fieldArray: {
          fieldGroup: [this.bautechnikSimulation()],
        },
        props: {
          docType: "Simulationsdaten",
        },
      },
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
        this.addInputInline("value", "Wert/Wertebereich"),
        this.addInputInline("unit", "Maßeinheit"),
      ],
    });
  }

  bautechnikSimulation() {
    return {
      name: "bautechnikSimulation",
      expressions: {
        hide: (field: FormlyFieldConfig) =>
          field.model?.type !== "bautechnikSimulation",
      },
      props: {
        label: "Simulationsdaten (Bautechnik)",
      },
      fieldGroup: [
        this.addSection("Simulationsdaten (Bautechnik)", [
          { key: "type" },
          this.addGroup("software", "Software", [
            this.addAutocomplete("name", null, {
              fieldLabel: "Name",
              wrappers: ["form-field"],
              required: true,
              options: this.getCodelistForSelect(
                "BAW_simulationSoftware",
                "null",
              ),
            }),
            this.addInput("version", null, {
              required: true,
              fieldLabel: "Version",
              wrappers: ["form-field"],
            }),
          ]),
          this.addRepeatList("object", "Objekt", {
            required: true,
            options: this.getCodelistForSelect("BAW_simulationObject", "null"),
          }),
          this.addRepeatList("objectPart", "Objektteil", {
            options: this.getCodelistForSelect(
              "BAW_simulationObjectPart",
              "null",
            ),
          }),
          this.addRepeatList("researchGoal", "Untersuchungsziel", {
            required: true,
            options: this.getCodelistForSelect(
              "BAW_simulationResearchGoal",
              "null",
            ),
          }),
          this.addGroup("dimension", "Dimensionen", [
            this.addSelect("spatialDimension", null, {
              fieldLabel: "Räumliche Dimensionen",
              wrappers: ["form-field"],
              options: this.getCodelistForSelect(
                "BAW_simulationSpatialDimension",
                "null",
              ),
            }),
            this.addCheckboxInline("timeDimension", "Zeit"),
          ]),
          this.addRepeatList("level", "Level der Untersuchung", {
            required: true,
            asSelect: true,
            options: this.getCodelistForSelect("BAW_simulationLevel", "null"),
          }),
          this.addRepeatList("phase", "Untersuchungsstufe nach TbW oder TbVS", {
            asSelect: true,
            options: this.getCodelistForSelect("BAW_simulationPhase", "null"),
          }),
          this.addButtonToggles("calculationConcept", "Berechnungskonzepte", {
            options: [
              {
                key: "isMaterialLinear",
                label: "materiell",
                options: [
                  { label: "linear", value: true },
                  { label: "nicht linear", value: false },
                ],
              },
              {
                key: "isGeometricLinear",
                label: "geometrisch",
                options: [
                  { label: "linear", value: true },
                  { label: "nicht linear", value: false },
                ],
              },
              {
                key: "hasImperfections",
                label: "Imperfektionen",
                options: [
                  { label: "mit", value: true },
                  { label: "ohne", value: false },
                ],
              },
            ],
          }),
          this.addRepeatList("materials", "Werkstoffe", {
            options: this.getCodelistForSelect(
              "BAW_simulationMaterial",
              "null",
            ),
          }),
          this.addSubSection(
            "materialParameters",
            "Grundlegende Werkstoffparameter",
            [
              this.addRepeat("reinforcement", "Fließgrenze der Bewehrung", {
                fields: [
                  this.addInput("yieldLimit", "Fließgrenze der Bewehrung", {
                    type: "number",
                    required: true,
                    className: "right-align",
                    wrappers: ["form-field", "addons"],
                    suffix: {
                      text: "N/mm²",
                    },
                  }),
                ],
              }),
              this.addRepeat("steel", "Fließgrenze Stahl", {
                fields: [
                  this.addInput("yieldLimit", "Fließgrenze Stahl", {
                    type: "number",
                    required: true,
                    className: "right-align",
                    wrappers: ["form-field", "addons"],
                    suffix: {
                      text: "N/mm²",
                    },
                  }),
                ],
              }),
              this.addRepeat("concrete", "Betondruckfestigkeit", {
                fields: [
                  this.addInput("compressiveStrength", "Betondruckfestigkeit", {
                    type: "number",
                    required: true,
                    wrappers: ["form-field"],
                    className: "right-align",
                  }),
                  this.addSelectInline("unitOfMeasure", "Kennwert", {
                    options: this.getCodelistForSelect(
                      "BAW_simulationConcreteUnit",
                      null,
                    ),
                    codelistId: "BAW_simulationConcreteUnit",
                    allowNoValue: false,
                    wrappers: ["form-field"],
                    expressions: {
                      "props.required": (field: FormlyFieldConfig) =>
                        isNotEmptyObject(field.form.value),
                    },
                  }),
                ],
              }),
            ],
          ),
          // subsection only for visual separation
          this.addSubSection(null, "", []),
          this.addRepeatList("materialModel", "Materialmodell", {
            options: this.getCodelistForSelect(
              "BAW_simulationMaterialModel",
              "null",
            ),
          }),
          this.addRepeatList("elementTypes", "Elementtypen", {
            options: this.getCodelistForSelect(
              "BAW_simulationElementType",
              "null",
            ),
          }),
          this.addRepeatList("effects", "Einwirkung", {
            options: this.getCodelistForSelect("BAW_simulationEffect", "null"),
          }),
          this.addRepeatList("physics", "Physik", {
            options: this.getCodelistForSelect("BAW_simulationPhysics", "null"),
          }),
          this.addRepeatList("analysisType", "Analysetyp", {
            options: this.getCodelistForSelect(
              "BAW_simulationAnalysisType",
              "null",
            ),
          }),
        ]),
      ],
    };
  }
}
