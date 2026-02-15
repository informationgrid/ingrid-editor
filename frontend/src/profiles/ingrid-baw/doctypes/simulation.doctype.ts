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
              options: [
                { label: "Dlubal", value: "Dlubal" },
                { label: "Dlubal: RStab", value: "Dlubal: RStab" },
                { label: "Dlubal: RFEM", value: "Dlubal: RFEM" },
                { label: "Dlubal: DUENQ", value: "Dlubal: DUENQ" },
                { label: "Dlubal: FE-Beul", value: "Dlubal: FE-Beul" },
                { label: "Dlubal: RWIND", value: "Dlubal: RWIND" },
                { label: "Dlubal: RSECTION", value: "Dlubal: RSECTION" },
                { label: "Dlubal: DICKQ", value: "Dlubal: DICKQ" },
                { label: "PTC Mathcad", value: "PTC Mathcad" },
                { label: "RIB Rohr", value: "RIB Rohr" },
                { label: "GGU Retain", value: "GGU Retain" },
                { label: "Matlab", value: "Matlab" },
                { label: "Sofistik", value: "Sofistik" },
                { label: "Atena", value: "Atena" },
                { label: "LS-Dyna", value: "LS-Dyna" },
                { label: "ANSYS", value: "ANSYS" },
                { label: "INCA", value: "INCA" },
                { label: "Frilo", value: "Frilo" },
                { label: "NiNoSp", value: "NiNoSp" },
              ],
            }),
            this.addInput("version", null, {
              required: true,
              fieldLabel: "Version",
              wrappers: ["form-field"],
            }),
          ]),
          this.addRepeatList("object", "Objekt", {
            required: true,
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
              { label: "Stoßschütze", value: "Stoßschütze" },
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
              {
                label: "Doppelklappen/Dachwehr",
                value: "Doppelklappen/Dachwehr",
              },
              { label: "Doppelschütz", value: "Doppelschütz" },
              {
                label: "Drucksegement (mit/ohne Aufsatzklappe)",
                value: "Drucksegement (mit/ohne Aufsatzklappe)",
              },
              { label: "Gleitschütz", value: "Gleitschütz" },
              { label: "Klapptore", value: "Klapptore" },
              { label: "Nadelwehr", value: "Nadelwehr" },
              { label: "Rollschütz", value: "Rollschütz" },
              { label: "Schiebetor", value: "Schiebetor" },
              { label: "Schlagtor", value: "Schlagtor" },
              { label: "Schlauchwehr", value: "Schlauchwehr" },
              { label: "Sektorflügeltor", value: "Sektorflügeltor" },
              { label: "Sektorwehr", value: "Sektorwehr" },
              { label: "Stauklappe", value: "Stauklappe" },
              { label: "Stemmtor", value: "Stemmtor" },
              { label: "Trommelwehr", value: "Trommelwehr" },
              { label: "Walzenwehr", value: "Walzenwehr" },
              {
                label: "Zugsegment (mit/ohne Aufsatzklappe)",
                value: "Zugsegment (mit/ohne Aufsatzklappe)",
              },
              { label: "Zylinderschütz", value: "Zylinderschütz" },
              { label: "Poller", value: "Poller" },
              { label: "Membran", value: "Membran" },
              {
                label: "Klemmleiste/Klemmschiene",
                value: "Klemmleiste/Klemmschiene",
              },
            ],
          }),
          this.addRepeatList("researchGoal", "Untersuchungsziel", {
            required: true,
            options: [
              {
                label: "Tragfähigkeitsnachweis",
                value: "Tragfähigkeitsnachweis",
              },
              {
                label: "Verformungsberechnung",
                value: "Verformungsberechnung",
              },
              { label: "Versagensabbildung", value: "Versagensabbildung" },
              { label: "Temperaturberechnung", value: "Temperaturberechnung" },
              {
                label: "Wissenschaftliche Untersuchung",
                value: "Wissenschaftliche Untersuchung",
              },
              {
                label: "Forschung & Entwicklung (F&E)",
                value: "Forschung & Entwicklung (F&E)",
              },
              {
                label: "Grenzzustandsbetrachtung",
                value: "Grenzzustandsbetrachtung",
              },
              { label: "Ermüdung", value: "Ermüdung" },
              {
                label: "Nachrechnung Bestand (TbW, TbVS)",
                value: "Nachrechnung Bestand (TbW, TbVS)",
              },
              { label: "Bemessung Neubau", value: "Bemessung Neubau" },
              {
                label: "Bruchmechanische Untersuchung",
                value: "Bruchmechanische Untersuchung",
              },
              {
                label: "Ermittlung Eigengewicht",
                value: "Ermittlung Eigengewicht",
              },
            ],
          }),
          this.addGroup("dimension", "Dimensionen", [
            this.addSelect("spatialDimension", null, {
              fieldLabel: "Räumliche Dimensionen",
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
            required: true,
            asSelect: true,
            options: [
              { label: "mean", value: "mean" },
              { label: "characteristic", value: "characteristic" },
              { label: "design", value: "design" },
            ],
          }),
          this.addRepeatList("phase", "Untersuchungsstufe nach TbW oder TbVS", {
            asSelect: true,
            options: [
              { label: "TbW A", value: "TbW A" },
              { label: "TbW B", value: "TbW B" },
              { label: "TbW C", value: "TbW C" },
              { label: "TbVS I", value: "TbVS I" },
              { label: "TbVS II", value: "TbVS II" },
              { label: "TbVS III", value: "TbVS III" },
            ],
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
            options: [
              { label: "Beton", value: "Beton" },
              { label: "Bewehrung", value: "Bewehrung" },
              { label: "Stahl", value: "Stahl" },
              { label: "Mauerwerk", value: "Mauerwerk" },
              { label: "Erdreich/Fels", value: "Erdreich/Fels" },
              {
                label: "Kunststoffe/Elastomere/Thermoplaste",
                value: "Kunststoffe/Elastomere/Thermoplaste",
              },
              {
                label: "Faserverstärkte Werkstoffe",
                value: "Faserverstärkte Werkstoffe",
              },
              { label: "Holz", value: "Holz" },
              { label: "Leichtmetal", value: "Leichtmetal" },
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
              { label: "Stahl: Fließplateau", value: "Stahl: Fließplateau" },
              {
                label: "Stahl: Wiederverfestigung",
                value: "Stahl: Wiederverfestigung",
              },
              {
                label: "Stahl: multilineare Spannungs-Dehnungslinie",
                value: "Stahl: multilineare Spannungs-Dehnungslinie",
              },
              { label: "Bruchmechanik", value: "Bruchmechanik" },
              { label: "Hyperelastizität", value: "Hyperelastizität" },
            ],
          }),
          this.addRepeatList("elementTypes", "Elementtypen", {
            options: [
              { label: "Stab/Balken", value: "Stab/Balken" },
              { label: "Scheiben", value: "Scheiben" },
              { label: "Platten", value: "Platten" },
              { label: "Schalen", value: "Schalen" },
              { label: "Volumen", value: "Volumen" },
              { label: "Federn", value: "Federn" },
              { label: "Interface/Kontakt", value: "Interface/Kontakt" },
            ],
          }),
          this.addRepeatList("einwirkung", "Einwirkung", {
            options: [
              { label: "experimentell", value: "experimentell" },
              { label: "Eigengewicht", value: "Eigengewicht" },
              { label: "Innerer Wasserdruck", value: "Innerer Wasserdruck" },
              { label: "Erddruck", value: "Erddruck" },
              { label: "Wasserdruck", value: "Wasserdruck" },
              { label: "Grundwasserdruck", value: "Grundwasserdruck" },
              {
                label: "Ständige Einwirkungen",
                value: "Ständige Einwirkungen",
              },
              {
                label: "Veränderliche Einwirkungen",
                value: "Veränderliche Einwirkungen",
              },
              {
                label: "Hydrostatische Einwirkungen",
                value: "Hydrostatische Einwirkungen",
              },
              {
                label: "Hydrodynamische Einwirkungen",
                value: "Hydrodynamische Einwirkungen",
              },
              {
                label:
                  "Hydrodynamische Einwirkungen bei Bewegung des Verschlußkörpers",
                value:
                  "Hydrodynamische Einwirkungen bei Bewegung des Verschlußkörpers",
              },
              { label: "Eisauflast", value: "Eisauflast" },
              { label: "Eisdruck", value: "Eisdruck" },
              { label: "Verkehrslast", value: "Verkehrslast" },
              { label: "Massenkräfte", value: "Massenkräfte" },
              {
                label: "Änderung der Stützbedingungen",
                value: "Änderung der Stützbedingungen",
              },
              { label: "Temperatureinflüsse", value: "Temperatureinflüsse" },
              { label: "Schiffsreibung", value: "Schiffsreibung" },
              { label: "Schiffsstoß", value: "Schiffsstoß" },
              { label: "Windlast", value: "Windlast" },
              {
                label: "Trossenzugkräfte auf Poller",
                value: "Trossenzugkräfte auf Poller",
              },
              { label: "Frischbetondruck", value: "Frischbetondruck" },
              {
                label: "Außergewöhnliche Einwirkungen",
                value: "Außergewöhnliche Einwirkungen",
              },
              {
                label: "Leckwerden von Luftkammern",
                value: "Leckwerden von Luftkammern",
              },
              {
                label: "Transport-, Montage- und Reparaturzustände",
                value: "Transport-, Montage- und Reparaturzustände",
              },
              {
                label: "Weitere vorzugebende Einwirkungen",
                value: "Weitere vorzugebende Einwirkungen",
              },
              {
                label: "Zweiseitig angetriebene Verschlußkörper",
                value: "Zweiseitig angetriebene Verschlußkörper",
              },
              {
                label: "Bewegungsbehinderung durch Fremdkörper",
                value: "Bewegungsbehinderung durch Fremdkörper",
              },
              {
                label: "Außergewöhnliche Einwirkungen des Antriebs im Störfall",
                value: "Außergewöhnliche Einwirkungen des Antriebs im Störfall",
              },
            ],
          }),
          this.addRepeatList("physics", "Physik", {
            options: [
              { label: "Strukturmechanik", value: "Strukturmechanik" },
              { label: "Strukturdynamik", value: "Strukturdynamik" },
              { label: "Fluiddynamik", value: "Fluiddynamik" },
              { label: "Thermomechanik", value: "Thermomechanik" },
              { label: "Thermodynamik", value: "Thermodynamik" },
              {
                label: "gekoppelt Temperatur/Struktur",
                value: "gekoppelt Temperatur/Struktur",
              },
              {
                label: "gekoppelt Fluid/Struktur",
                value: "gekoppelt Fluid/Struktur",
              },
            ],
          }),
          this.addRepeatList("analysisType", "Analysetyp", {
            options: [
              { label: "Spannungsanalyse", value: "Spannungsanalyse" },
              { label: "Modalanalyse", value: "Modalanalyse" },
              { label: "Schwingungsanalyse", value: "Schwingungsanalyse" },
              { label: "Eigenwertanalyse", value: "Eigenwertanalyse" },
              {
                label: "Wärmeleitung und Diffusion",
                value: "Wärmeleitung und Diffusion",
              },
              { label: "Transportproblem", value: "Transportproblem" },
              { label: "Beulanalyse", value: "Beulanalyse" },
              { label: "Verformung", value: "Verformung" },
            ],
          }),
        ]),
      ],
    };
  }
}
