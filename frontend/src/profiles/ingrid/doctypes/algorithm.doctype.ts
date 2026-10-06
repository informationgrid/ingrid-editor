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
import { IngridClass, IngridShared } from "./ingrid-shared";
import { SelectOptions } from "../../form-field-helper";

@Injectable({
  providedIn: "root",
})
export class AlgorithmDoctype extends IngridShared {
  id = "InGridAlgorithm";

  label = "Algorithmus";

  iconClass = "algorithm";

  hasOptionalFields = true;

  documentFields = () => {
    this.handleDoiBehaviour();

    const fields = <FormlyFieldConfig[]>[
      this.addGeneralSection(),
      this.addKeywordsSection(),

      this.addSection(
        "Daten",
        [
          this.addTextArea("trainingData", "Trainingsdaten", "", {
            required: true,
          }),
          this.addTextArea("dataBias", "Daten-Bias"),
          this.addRepeat("inputData", "Input-Daten", {
            fieldGroupClassName: "flex-col",
            hasExtendedGap: true,
            showBorder: true,
            addButtonTitle: "Datensatz hinzufügen",
            fields: this.getInputOutputFields(),
          }),
          this.addRepeat("outputData", "Output-Daten", {
            fieldGroupClassName: "flex-col",
            hasExtendedGap: true,
            showBorder: true,
            addButtonTitle: "Datensatz hinzufügen",
            fields: this.getInputOutputFields(),
          }),
        ].filter(Boolean),
      ),
      this.addSection("Algorithmus", [
        this.addSelect("algorithmType", "Art des Algorithmus", {
          required: true,
          options: [
            { value: "self-learning", label: "Selbstlernalgorithmus" },
            { value: "rule-based", label: "Regelbasiert" },
            { value: "hybrid", label: "Hybrid" },
          ],
        }),

        this.addTextArea("explanation", "Erklärung", "", {
          required: true,
          contextHelpId: "erlauterung-algorithmus",
        }),
        this.addRepeatList("methods", "Methoden und Modelle"),
        this.addTextArea("errorBias", "Fehler/Bias"),
      ]),
      this.addSection("Übersicht", [
        this.addTextArea("monitoring", "Performance-Monitoring", "", {
          required: true,
        }),
        this.addSelect("typeOfUse", "Art der Verwendung des Algorithmus", {
          required: true,
          options: [
            { value: "descriptive", label: "Beschreibend" },
            { value: "diagnostic", label: "Diagnostisch" },
            { value: "predictive", label: "Prädiktiv" },
            { value: "prescriptive", label: "Prescriptive" },
          ],
        }),
      ]),
      this.addSection("Verweise", [
        this.addInput("publiccodeUrl", "URL zu publiccode.yml", {
          contextHelpId: "publiccodeUrl",
          validators: {
            validation: ["url"],
          },
          wrappers: ["panel", "form-field"],
        }),
        this.addInput("sourceCodeUrl", "Quellcode URL", {
          contextHelpId: "sourceCodeUrl",
          validators: {
            validation: ["url"],
          },
          wrappers: ["panel", "form-field"],
        }),
        this.addInput("websiteUrl", "Webseite", {
          contextHelpId: "websiteUrl",
          validators: {
            validation: ["url"],
          },
          wrappers: ["panel", "form-field"],
        }),
        this.addInput("exampleUrl", "Link zur Beispielanwendung", {
          contextHelpId: "exampleUrl",
          validators: {
            validation: ["url"],
          },
          wrappers: ["panel", "form-field"],
        }),
        this.addRepeat("serviceUrls", "Service-Urls", {
          className: "optional",
          fields: [
            this.addInputInline("name", "Name", { required: true }),
            this.addInputInline("url", "URL", {
              required: true,
              validators: {
                validation: ["url"],
              },
            }),
          ],
        }),
      ]),
      this.addSpatialSection(),
      this.addTimeReferenceSection(),
      this.addAdditionalInformationSection({
        extraInfoLangData: true,
        optionalSection: this.options.optional.additionalInformationSection,
      }),
      this.addAvailabilitySection(),
      this.addFileReferences(),
    ].filter(Boolean);

    return this.manipulateDocumentFields(fields);
  };

  /**
   * Fields for one dataset entry: dataset name and URL on the top level,
   * optional attributes (name, unit, spatial and temporal resolution) below.
   */
  private getInputOutputFields() {
    return [
      this.addGroupSimple(
        null,
        [
          this.addInputInline("name", "Datensatzname", { required: true }),
          this.addInputInline("url", "URL", {
            validators: {
              validation: ["url"],
            },
          }),
        ],
        { fieldGroupClassName: "flex-row" },
      ),
      this.addRepeat("attributes", null, {
        wrappers: [],
        addButtonTitle: "Attribut hinzufügen",
        fields: [
          this.addInputInline("name", "Attributname", {
            required: true,
            className: "flex-2",
          }),
          this.addInputInline("unit", "Einheit"),
          this.addInputInline("spatialResolution", "Räumliche Auflösung"),
          this.addInputInline("temporalResolution", "Zeitliche Auflösung"),
        ],
      }),
    ];
  }
}
