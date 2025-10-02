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
        validators: {
          consistent: (control, field) => {
            const missingType = field.model?.some((item) => !item.type);
            if (missingType) {
              throw new Error(
                "Datensatz inkonsistent. Bitte laden Sie die IGE-NG Seite erneut.",
              );
            }
            return true;
          },
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
              options: [{ label: "Dlubal", value: "Dlubal" }],
            }),
            this.addAutocomplete("version", null, {
              fieldLabel: "Version",
              wrappers: ["form-field"],
              options: [{ label: "1", value: "1" }],
            }),
          ]),
          this.addRepeatList("object", "Objekt", {
            options: [
              { label: "Schleusen: Kammern", value: "Schleusen: Kammern" },
              { label: "Schleusen: Häupter", value: "Schleusen: Häupter" },
              {
                label: "Schleusen: Oberhäupter",
                value: "Schleusen: Oberhäupter",
              },
              {
                label: "Schleusen: Unterhäupter",
                value: "Schleusen: Unterhäupter",
              },
              { label: "Wehre: Wehrpfeiler", value: "Wehre: Wehrpfeiler" },
              { label: "Wehre: Wehrfelder", value: "Wehre: Wehrfelder" },
              { label: "Brücken", value: "Brücken" },
              { label: "Kanalbrücken", value: "Kanalbrücken" },
              { label: "Molen", value: "Molen" },
              { label: "Talsperren", value: "Talsperren" },
              { label: "Leuchttürme", value: "Leuchttürme" },
              {
                label: "Unterführungsbauwerke",
                value: "Unterführungsbauwerke",
              },
              {
                label: "Fischaufstiegsanlagen",
                value: "Fischaufstiegsanlagen",
              },
              {
                label: "Verschlusskörper: Umlauf-/Grundlauf-/Füllschütze",
                value: "Verschlusskörper: Umlauf-/Grundlauf-/Füllschütze",
              },
              {
                label: "Verschlusskörper: Sparbecken",
                value: "Verschlusskörper: Sparbecken",
              },
              {
                label: "Verschlusskörper: Wehre",
                value: "Verschlusskörper: Wehre",
              },
              {
                label: "Verschlusskörper: Hochwasserentlastungen",
                value: "Verschlusskörper: Hochwasserentlastungen",
              },
              {
                label: "Verschlusskörper: Grundablässe",
                value: "Verschlusskörper: Grundablässe",
              },
              {
                label: "Verschlusskörper: Revisionen",
                value: "Verschlusskörper: Revisionen",
              },
              { label: "Schiffshebewerke", value: "Schiffshebewerke" },
              { label: "Schleusentore", value: "Schleusentore" },
              { label: "Poller", value: "Poller" },
              { label: "Stoßschütze", value: "Stoßschütze" },
              {
                label: "Schlauchwehre: Menbran",
                value: "Schlauchwehre: Menbran",
              },
              {
                label: "Schlauchwehre: Klemmleiste/Klemmschiene",
                value: "Schlauchwehre: Klemmleiste/Klemmschiene",
              },
              { label: "Spundwände", value: "Spundwände" },
              { label: "Düker", value: "Düker" },
              { label: "Feste Teile", value: "Feste Teile" },
              { label: "Maschinenteile", value: "Maschinenteile" },
              {
                label: "Überbauten: Wehrstege/-brücken",
                value: "Überbauten: Wehrstege/-brücken",
              },
              {
                label: "Überbauten: Hubportale",
                value: "Überbauten: Hubportale",
              },
              { label: "Verbindungselemente", value: "Verbindungselemente" },
              { label: "Sperrwerke", value: "Sperrwerke" },
            ],
          }),
          this.addRepeatList("objectPart", "Objektteil", {
            options: [
              { label: "Aufsatzklappe", value: "Aufsatzklappe" },
              { label: "Dammbalken", value: "Dammbalken" },
            ],
          }),
          this.addRepeatList("researchGoal", "Untersuchungsziel", {
            options: [
              {
                label: "Tragfähigkeitsnachweis",
                value: "Tragfähigkeitsnachweis",
              },
              {
                label: "Verformungsberechnung",
                value: "Verformungsberechnung",
              },
            ],
          }),
          this.addGroup("dimension", "Dimensionen", [
            this.addSelect("spatialDimension", null, {
              fieldLabel: "Räumliche Dimensionen",
              showSearch: true,
              wrappers: ["form-field"],
              options: [
                { label: "1D", value: "1D" },
                { label: "2D", value: "2D" },
                { label: "3D", value: "3D" },
              ],
            }),
            this.addCheckboxInline("timeDimension", "Zeit"),
          ]),
          this.addRepeatList("level", "Level der Untersuchung", {
            options: [
              { label: "mean", value: "mean" },
              { label: "design", value: "design" },
            ],
          }),
          this.addRepeatList("phase", "Untersuchungsstufe nach TbW oder TbVS", {
            options: [
              { label: "A", value: "A" },
              { label: "B", value: "B" },
              { label: "C", value: "C" },
              { label: "I", value: "I" },
              { label: "II", value: "II" },
              { label: "III", value: "III" },
            ],
          }),
          this.addGroup("concept", "Berechnungskonzepte", [
            this.addCheckboxInline("materiell", "materiell linear"),
            this.addCheckboxInline("geometrisch", "geometrisch linear"),
            this.addCheckboxInline("imperfections", "Imperfektionen"),
          ]),
          this.addRepeatList("materials", "Werkstoffe", {
            options: [
              { label: "Beton", value: "Beston" },
              { label: "Bewehrung", value: "Bewehrung" },
            ],
          }),
          this.addRepeat("concrete", "Grundlegende Werkstoffparameter", {
            fields: [
              this.addInputInline("denominator", "Betondruckfestigkeit", {
                type: "number",
              }),
              this.addInputInline(
                "distanceMeter",
                "Fließgrenze der Bewehrung",
                {
                  type: "number",
                  className: "flex-1 right-align",
                  wrappers: ["form-field"],
                  suffix: {
                    text: "m",
                  },
                },
              ),
              this.addInputInline("distanceDPI", "Fließgrenze Stahl", {
                type: "number",
                className: "flex-1 right-align",
                wrappers: ["form-field"],
              }),
            ],
          }),
          this.addRepeatList("materialModel", "Materialmodell", {
            options: [
              { label: "Stahl", value: "Stahl" },
              { label: "Fließplateau", value: "Fließplateau" },
              { label: "Bruchmechanik", value: "Bruchmechanik" },
            ],
          }),
          this.addRepeatList("elementTypes", "Elementtypen", {
            options: [
              { label: "Stab/Balken", value: "StabBalken" },
              { label: "Scheiben", value: "Scheiben" },
            ],
          }),
          this.addRepeatList("einwirkung", "Einwirkung", {
            options: [
              { label: "Eigengewicht", value: "Eigengewicht" },
              { label: "Erddruck", value: "Erddruck" },
            ],
          }),
          this.addRepeatList("physics", "Physik", {
            options: [
              { label: "Strukturmechanik", value: "Strukturmechanik" },
              { label: "Strukturdynamik", value: "Strukturdynamik" },
            ],
          }),
          this.addRepeatList("analysisType", "Analysetyp", {
            options: [
              { label: "Spannungsanalyse", value: "Spannungsanalyse" },
              { label: "Schwingungsanalyse", value: "Schwingungsanalyse" },
            ],
          }),
        ]),
      ],
    };
  }
}
