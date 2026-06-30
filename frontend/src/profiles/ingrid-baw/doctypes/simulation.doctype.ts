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
        this.getVersionFieldConfig(),
        this.getExtensionFieldConfig(),
        this.getDimensionalityFieldConfig(),
        this.common.getTimestepFieldConfig(),
        this.getSimulationModelTypeFieldConfig(),
        this.getSimulationParameterFieldConfig(),
      ]),
      {
        key: "simulationPhases",
        type: "bawPhases",
        fieldArray: {
          fieldGroup: [this.bautechnikSimulation(), this.cfdSimulation()],
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

  private getVersionFieldConfig(): FormlyFieldConfig {
    return this.addRepeatList("version", "Version");
  }

  private getExtensionFieldConfig(): FormlyFieldConfig {
    return this.addRepeatList("extension", "Erweiterung");
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
              codelistId: "BAW_simulationSoftware",
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
            codelistId: "BAW_simulationObject",
          }),
          this.addRepeatList("objectPart", "Objektteil", {
            options: this.getCodelistForSelect(
              "BAW_simulationObjectPart",
              "null",
            ),
            codelistId: "BAW_simulationObjectPart",
          }),
          this.addRepeatList("researchGoal", "Untersuchungsziel", {
            required: true,
            options: this.getCodelistForSelect(
              "BAW_simulationResearchGoal",
              "null",
            ),
            codelistId: "BAW_simulationResearchGoal",
          }),
          this.addGroup("dimension", "Dimensionen", [
            this.addSelect("spatialDimension", null, {
              fieldLabel: "Räumliche Dimensionen",
              wrappers: ["form-field"],
              options: this.getCodelistForSelect(
                "BAW_simulationSpatialDimension",
                "null",
              ),
              codelistId: "BAW_simulationSpatialDimension",
            }),
            this.addCheckboxInline("timeDimension", "Zeit"),
          ]),
          this.addRepeatList("level", "Level der Untersuchung", {
            required: true,
            asSelect: true,
            options: this.getCodelistForSelect("BAW_simulationLevel", "null"),
            codelistId: "BAW_simulationLevel",
          }),
          this.addRepeatList("phase", "Untersuchungsstufe nach TbW oder TbVS", {
            asSelect: true,
            options: this.getCodelistForSelect("BAW_simulationPhase", "null"),
            codelistId: "BAW_simulationPhase",
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
            codelistId: "BAW_simulationMaterial",
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
                    wrappers: ["form-field", "addons"],
                    className: "right-align",
                    suffix: {
                      text: "N/mm²",
                    },
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
          this.addRepeatList("materialModel", "Materialmodell", {
            options: this.getCodelistForSelect(
              "BAW_simulationMaterialModel",
              "null",
            ),
            codelistId: "BAW_simulationMaterialModel",
          }),
          this.addRepeatList("elementTypes", "Elementtypen", {
            options: this.getCodelistForSelect(
              "BAW_simulationElementType",
              "null",
            ),
            codelistId: "BAW_simulationElementType",
          }),
          this.addRepeatList("effects", "Einwirkung", {
            options: this.getCodelistForSelect("BAW_simulationEffect", "null"),
            codelistId: "BAW_simulationEffect",
          }),
          this.addRepeatList("physics", "Physik", {
            options: this.getCodelistForSelect("BAW_simulationPhysics", "null"),
            codelistId: "BAW_simulationPhysics",
          }),
          this.addRepeatList("analysisType", "Analysetyp", {
            options: this.getCodelistForSelect(
              "BAW_simulationAnalysisType",
              "null",
            ),
            codelistId: "BAW_simulationAnalysisType",
          }),
        ]),
      ],
    };
  }

  cfdSimulation() {
    return {
      name: "cfdSimulation",
      expressions: {
        hide: (field: FormlyFieldConfig) =>
          field.model?.type !== "cfdSimulation",
      },
      props: {
        label: "CFD-Simulationen (Schiff)",
      },
      fieldGroup: [
        this.addSection("CFD-Simulationen (Schiff)", [
          { key: "type" },
          this.addRepeatList("shipName", "BAW-Schiffsname", {
            options: this.getCodelistForSelect("BAW_shipName", "null"),
            codelistId: "BAW_shipName",
          }),
          this.addAutocomplete("physics", "Angaben zur Physik", {
            options: this.getCodelistForSelect("BAW_physics", "null"),
            codelistId: "BAW_physics",
          }),
          this.addButtonToggles("properties", "Eigenschaften", {
            options: [
              {
                key: "constantCrossSection",
                label: "Konstante Querschnitt",
                options: [
                  { label: "ja", value: true },
                  { label: "nein", value: false },
                ],
              },
              {
                key: "propulsion",
                label: "Propulsion",
                options: [
                  { label: "ja", value: true },
                  { label: "nein", value: false },
                ],
              },
            ],
          }),
          this.addAutocomplete("movementType", "Bewegungsarten", {
            options: this.getCodelistForSelect("BAW_movementType", "null"),
            codelistId: "BAW_movementType",
          }),
          this.addAutocomplete("trajectory", "Trajektorie", {
            options: this.getCodelistForSelect("BAW_trajectory", "null"),
            codelistId: "BAW_trajectory",
          }),
          this.addInput("cellCount", "Zellanzahl", {
            className: "single-field width-25 right-align",
            type: "number",
            wrappers: ["panel", "form-field"],
          }),
        ]),
      ],
    };
  }
}
