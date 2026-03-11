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
import { BaseDoctype } from "../../base.doctype";
import { inject, Injectable } from "@angular/core";
import { UploadService } from "../../../app/shared/upload/upload.service";
import { ConfigService } from "../../../app/services/config/config.service";
import { map } from "rxjs/operators";
import { of } from "rxjs";
import { SpatialLocationType } from "../../../app/formly/types/map/spatial-list/spatial-list.component";
import { FormControl } from "@angular/forms";
import {
  MetadataOptionItems,
  MetadataProps,
} from "../../../app/formly/types/metadata-type/metadata-type.component";

// TODO: check out this, for handling functions in json schema: https://stackblitz.com/edit/angular-g1h2be-hpwffy

@Injectable({
  providedIn: "root",
})
export class OpenDataDoctype extends BaseDoctype {
  id = "OpenDataDoc";

  label = "Open Data Dokument";

  iconClass = "Fachaufgabe";

  showOpendata: boolean = false;

  private uploadService = inject(UploadService);
  private configService = inject(ConfigService);

  options = {
    spatialTypes: ["free", "wkt", "wfsgnde"] as SpatialLocationType[],
    temporalLegacy: false,
  };

  documentFields = () => <FormlyFieldConfig[]>[
      this.showOpendata
        ? this.addSection("Merkmale", [
            <FormlyFieldConfig>{
              key: "properties",
              type: "metadata",
              defaultValue: { isOpenData: true },
              props: <MetadataProps>{
                availableOptions: [
                  {
                    label: "Open Data",
                    typeOptions: [
                      <MetadataOptionItems>{
                        multiple: true,
                        items: [
                          {
                            label: "Offene Lizenz",
                            key: "isOpenData",
                            value: true,
                            contextHelpKey: "isOpenData",
                            onClick: (field: FormlyFieldConfig) =>
                              this.handleOpenDataClick(field),
                          },
                          {
                            label: "High-Value-Dataset",
                            key: "isHvd",
                            value: true,
                            contextHelpKey: "isHvd",
                            onClick: (field: FormlyFieldConfig) =>
                              this.handleHVDClick(field),
                          },
                        ].filter(Boolean),
                      },
                    ],
                  },
                ],
                disabledOptions: {},
              },
            },
          ])
        : null,
      this.addSection("Allgemeines", [
        this.addTextArea("description", "Beschreibung", this.id, {
          required: true,
        }),
        this.addInput("landingPage", "Webseite", {
          wrappers: ["panel", "form-field"],
          placeholder: "https://...",
          validators: {
            validation: ["url"],
          },
        }),
        this.addAddressCard("addresses", "Adressen", {
          required: true,
          allowedTypes: ["2", "6", "7", "10", "11"],
          validators: {
            needPublisher: {
              expression: (ctrl) =>
                ctrl.value
                  ? ctrl.value.some((row) => row.type.key === "10")
                  : false,
              message:
                'Fehler: Es muss eine Adresse als "veröffentlichende Stelle" eingetragen sein.',
            },
            onePublisher: {
              expression: (ctrl) =>
                ctrl.value
                  ? ctrl.value.filter((row) => row.type.key === "10").length < 2
                  : true,
              message:
                "Fehler: Es darf nur eine Adresse als veröffentlichende Stelle angegeben werden",
            },
          },
        }),
        this.addRepeatList("keywords", "Schlagworte", {
          view: "chip",
          hint: "Mehrere Schlagworte durch Komma trennen und mit der Eingabetaste bestätigen.",
        }),
      ]),
      this.addSection(
        "Open Data",
        [
          this.addRepeatList("DCATThemes", "Open Data Kategorien", {
            view: "chip",
            asSelect: true,
            required: true,
            options: this.getCodelistForSelect("6400", "openDataCategories"),
            codelistId: "6400",
            expressions: {
              "props.required": (field: FormlyFieldConfig) =>
                !this.showOpendata ||
                field.options.formState.mainModel?.properties?.isOpenData ===
                  true,
            },
          }),
          this.showOpendata
            ? null
            : this.addCheckbox("isHvd", "High-Value-Dataset (HVD)", {
                className: "flex-1",
                click: (field: FormlyFieldConfig) =>
                  this.handleHVDClick(field).subscribe(),
              }),
          this.addRepeatList("hvdCategories", "HVD-Kategorien", {
            view: "chip",
            showSearch: true,
            asSelect: true,
            expressions: {
              hide: (field: FormlyFieldConfig) =>
                field.model.isHvd !== true &&
                field.model.properties.isHvd !== true,
            },
            options: this.getCodelistForSelect(
              "hvdCategories",
              "hvdCategories",
            ),
            codelistId: "hvdCategories",
            required: true,
          }),
          this.addRepeatDistributionDetailList("distributions", "Ressourcen", {
            backendUrl: this.configService.getConfiguration().backendUrl,
            infoText:
              "Nutzen Sie soweit möglich maschinenlesbare Dateiformate für Ihre Daten.",
            jsonTemplate: {
              format: { key: null },
              title: "",
              description: "",
              license: null,
              byClause: "",
              languages: [],
              plannedAvailability: null,
            },
            fields: [
              this.addGroupSimple(null, [
                { key: "_title" },
                this.addInputInline("title", "Titel", {
                  contextHelpId: "distribution_title",
                  hasInlineContextHelp: true,
                  wrappers: ["inline-help", "form-field"],
                }),
                {
                  key: "link",
                  type: "upload",
                  label: "Link",
                  class: "flex-2",
                  wrappers: ["form-field", "inline-help"],
                  props: {
                    label: "Link",
                    appearance: "outline",
                    required: true,
                    hasInlineContextHelp: true,
                    contextHelpId: "distribution_link",
                    onClick: (docUuid, uri, $event) => {
                      this.uploadService.downloadFile(docUuid, uri, $event);
                    },
                  },
                  expressions: {
                    "props.label": (field) =>
                      field.formControl.value?.asLink
                        ? "URL (Link)"
                        : "Dateiname (Upload)",
                  },
                },
                this.addDatepickerInline("modified", "Aktualisierungsdatum", {
                  placeholder: "TT.MM.JJJJ",
                  wrappers: ["inline-help", "form-field"],
                  hasInlineContextHelp: true,
                  contextHelpId: "distribution_modified",
                }),
                this.addSelectInline("format", "Format", {
                  showSearch: true,
                  options: this.getCodelistForSelect(
                    "20003",
                    "distributions.format",
                  ).pipe(
                    map((data) => {
                      return data;
                    }),
                  ),
                  codelistId: "20003",
                  wrappers: ["inline-help", "form-field"],
                  hasInlineContextHelp: true,
                }),
                this.addRepeatListInline("languages", "Sprachen", {
                  view: "chip",
                  asSelect: true,
                  placeholder: "Sprachen",
                  options: this.getCodelistForSelect(
                    "20007",
                    "distributions.languages",
                  ),
                  codelistId: "20007",
                  wrappers: ["inline-help"],
                  hasInlineContextHelp: true,
                  contextHelpId: "language",
                }),
                this.addTextAreaInline("description", "Beschreibung", "bmi", {
                  wrappers: ["form-field", "inline-help"],
                  hasInlineContextHelp: true,
                  contextHelpId: "distribution_description",
                }),
                this.addSelectInline("license", "Lizenz", {
                  required: true,
                  showSearch: true,
                  options: this.getCodelistForSelect(
                    "20004",
                    "distributions.license",
                  ),
                  codelistId: "20004",
                  wrappers: ["inline-help", "form-field"],
                  hasInlineContextHelp: true,
                }),
                this.addInputInline(
                  "byClause",
                  'Namensnennungstext für "By"-Clauses',
                  {
                    wrappers: ["inline-help", "form-field"],
                    hasInlineContextHelp: true,
                  },
                ),
                this.addSelectInline("availability", "geplante Verfügbarkeit", {
                  options: this.getCodelistForSelect(
                    "20005",
                    "distributions.availability",
                  ),
                  codelistId: "20005",
                  wrappers: ["inline-help", "form-field"],
                  hasInlineContextHelp: true,
                }),
              ]),
            ],
            validators: {
              requiredEntry: {
                expression: (ctrl) => ctrl.value?.length > 0,
                message: "Fehler: Bitte erstellen Sie mindestens einen Eintrag",
              },
              requiredUrlAndLicense: {
                expression: (ctrl) =>
                  ctrl.value?.every(
                    (entry) => entry.license && entry.link?.uri,
                  ),
                message:
                  "Fehler: Es muss für jede Ressource eine Lizenz und ein Link (bzw. Dateiname) angegeben werden (Ressource bearbeiten).",
              },
            },
            expressions: {
              "props.required": (field: FormlyFieldConfig) =>
                !this.showOpendata ||
                field.options.formState.mainModel?.properties?.isOpenData ===
                  true,
            },
          }),
          this.addInput(
            "legalBasis",
            "Rechtsgrundlage für die Zugangseröffnung",
            {
              wrappers: ["panel", "form-field"],
            },
          ),
          this.addInput("qualityProcessURI", "Qualitätssicherungsprozess URI", {
            wrappers: ["panel", "form-field"],
          }),
        ].filter(Boolean),
      ),
      this.addSection("Raumbezüge", [
        this.addSpatial("spatial", "Raumbezüge", {
          limitTypes: this.options.spatialTypes,
        }),
        this.addSelect(
          "politicalGeocodingLevel",
          "Ebene der geopolitischen Abdeckung",
          {
            options: this.getCodelistForSelect(
              "20006",
              "politicalGeocodingLevel",
            ),
            codelistId: "20006",
          },
        ),
      ]),
      this.addSection(
        "Zeitbezüge",
        [
          this.options.temporalLegacy
            ? this.addGroup("temporal", "Zeitliche Abdeckung der Daten", [
                this.addSelect("rangeType", null, {
                  showSearch: false,
                  className: "flex-1",
                  wrappers: ["form-field"],
                  options: [
                    { label: "am", value: "at" },
                    { label: "seit", value: "since" },
                    { label: "bis", value: "till" },
                    { label: "von - bis", value: "range" },
                  ],
                }),
                this.addDatepicker("timeSpanDate", null, {
                  placeholder: "TT.MM.JJJJ",
                  wrappers: ["form-field"],
                  fieldLabel: "Datum",
                  required: true,
                  expressions: {
                    hide: (field: FormlyFieldConfig) =>
                      field.model?.rangeType?.key == null ||
                      field.model?.rangeType?.key === "range",
                  },
                }),
                this.addDateRange("timeSpanRange", null, {
                  wrappers: [],
                  fieldLabel: "Datum",
                  required: true,
                  expressions: {
                    hide: (field: FormlyFieldConfig) =>
                      field.model?.rangeType?.key !== "range",
                  },
                }),
                this.addSelect("periodicity", "Periodizität", {
                  showSearch: true,
                  options: this.getCodelistForSelect("518", "periodicity"),
                  codelistId: "518",
                }),
              ])
            : null,
          ...(this.options.temporalLegacy
            ? null
            : [
                this.addSelect("accrualPeriodicity", "Periodizität", {
                  showSearch: true,
                  options: this.getCodelistForSelect(
                    "518",
                    "accrualPeriodicity",
                  ),
                  codelistId: "518",
                }),
                this.addUnitInput(
                  "userDefinedAccrualPeriodicity",
                  "Benutzerdefiniertes Intervall der Erhebung",
                  {
                    type: "number",
                    placeholder: "Bitte eingeben ...",
                    unitOptions: this.getCodelistForSelect(
                      "1230",
                      "maintenanceInformation.userDefinedAccrualPeriodicity.unit",
                    ),
                    codelistId: "1230",
                    fieldGroup: [{ key: "number" }, { key: "unit" }],
                    hintStart:
                      "Wenn ein Intervall angegeben werden kann, geben Sie das Intervall an, in dem der Datensatz aktualisiert wird.",
                    expressions: {
                      className: (field: FormlyFieldConfig) => {
                        const notEmpty = !isNaN(
                          parseInt(
                            field.form.value?.userDefinedAccrualPeriodicity
                              ?.number,
                          ),
                        );
                        const isNotContinuously =
                          field.options.formState.mainModel?.accrualPeriodicity
                            ?.key !== "1";
                        if (!notEmpty && isNotContinuously) return "hide";
                        return notEmpty
                          ? "right-align"
                          : "right-align optional";
                      },
                    },
                    validators: {
                      min: {
                        expression: (ctrl: FormControl) =>
                          ctrl.value.number === undefined ||
                          ctrl.value.number >= 0,
                        message: "Der Wert darf nicht negativ sein",
                      },
                      continuously: {
                        expression: (ctrl: FormControl) => {
                          const frequency =
                            ctrl.root.get("accrualPeriodicity")?.value?.key;
                          return !ctrl.value?.number || frequency === "1";
                        },
                        message:
                          "Werte im Feld 'Intervall der Erhebung' dürfen nur angegeben werden, wenn das Feld 'Pflege- und Aktualisierungsintervall' nicht auf den Wert 'kontinuierlich' eingestellt wurde.",
                      },
                    },
                  },
                ),
                this.addSubSection(
                  "temporal",
                  "Zeitbezug der Daten im Datensatz",
                  [
                    {
                      key: "data",
                      type: "time-reference",
                      wrappers: [],
                      defaultValue: { type: "none" },
                      props: {
                        // required: this.options.required.resourceDateType,
                      },
                    },
                  ],
                ),
              ]),
        ].filter(Boolean),
      ),
    ].filter(Boolean);

  private handleHVDClick(field: FormlyFieldConfig) {
    const hvdChecked = field.formControl.value.isHvd;
    const isOpenData = field.formControl.value.isOpenData;
    // if hvd is checked and field is not open data, show open data dialog
    if (hvdChecked && !isOpenData) {
      field.formControl.setValue({
        ...field.formControl.value,
        isOpenData: true,
      });
      this.handleOpenDataClick(field);
    } else {
      return of(true);
    }
  }

  private handleOpenDataClick(field: FormlyFieldConfig) {
    const isChecked = field.formControl.value.isOpenData;
    if (isChecked) {
      // this.handleActivateOpenData(field).subscribe();
    } else {
      field.formControl.setValue({ ...field.formControl.value, isHvd: false });
    }
  }
}
