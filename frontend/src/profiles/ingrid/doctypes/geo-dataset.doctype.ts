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
import { SelectOptionUi } from "../../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { IngridShared } from "./ingrid-shared";
import { isNotEmptyObject } from "../../../app/shared/utils";
import { generateUUID } from "../../../app/services/utils";
import { map } from "rxjs/operators";
import {
  MetadataOption,
  MetadataOptionItem,
} from "../../../app/formly/types/metadata-type/metadata-type.component";
import { of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GeoDatasetDoctype extends IngridShared {
  id = "InGridGeoDataset";

  label = "Geodatensatz";

  iconClass = "Geodatensatz";

  hasOptionalFields = true;

  geodatasetOptions = {
    required: {
      statement: true,
      subType: true,
      identifier: true,
    },
    dynamicRequired: {
      citation:
        "formState.mainModel?.featureCatalogueDescription?.featureTypes?.length > 0",
      identifier: undefined,
      statement: undefined,
    },
    validators: {
      identifier: null,
    },
  };

  showInspireRelevant = true;
  showInspireConform = true;
  showHVD = true;
  showAdVCompatible = true;
  showAdVProductGroup = true;
  showIdentifierCreateButton = true;
  isGeoDataset = true;
  defaultKeySpatialScope = "885989663";

  constructor() {
    super();
    this.options.required.spatialSystems = true;
    this.options.required.useConstraints = true;
    this.options.required.extraInfoLangData = true;
    this.options.dynamicRequired.dataFormat =
      "formState.mainModel?.properties?.isInspireIdentified";
    this.options.dynamicRequired.spatialScope =
      "formState.mainModel?.properties?.isInspireIdentified";
  }

  protected metadataOptions(): MetadataOption[] {
    return [
      {
        label: "Datentyp",
        contextHelpKey: "subType",
        required: this.geodatasetOptions.required.subType,
        typeOptions: [
          {
            multiple: false,
            key: "subType",
            codelistId: "525",
            // TODO: try to only use codelistId, since codelist mapping also happens
            //       in metadata-type-short component, where it's needed for print preview
            asyncItems: this.getCodelistForSelect("525", "subType").pipe(
              map((items) => {
                return items.map((item) => {
                  return <MetadataOptionItem>{
                    label: item.label,
                    value: { key: item.value },
                  };
                });
              }),
            ),
          },
        ],
      },
      ...super.metadataOptions(),
    ];
  }

  documentFields = () => {
    this.handleInVeKoSBehaviour();

    const fields = <FormlyFieldConfig[]>[
      this.addGeneralSection({
        thesaurusTopics: true,
        // TODO AW: activate subType only from geodataset
        /*additionalGroup: this.addSelect("subType", "Datensatz/Datenserie", {
          required: this.geodatasetOptions.required.subType,
          options: this.getCodelistForSelect("525", "subType"),
          codelistId: "525",
        }),*/
      }),
      this.addKeywordsSection({
        priorityDataset: true,
        spatialScope: true,
        thesaurusTopics: true,
        inspireTopics: true,
      }),

      this.addSection("Fachbezug", [
        this.addGroupSimple("lineage", [
          this.addTextArea("statement", "Fachliche Grundlage", this.id, {
            required: this.geodatasetOptions.required.statement,
            expressions: {
              "props.required":
                this.geodatasetOptions.dynamicRequired.statement,
            },
          }),
        ]),
        this.addInput("identifier", "Identifikator der Datenquelle", {
          required: this.geodatasetOptions.required.identifier,
          validators: this.geodatasetOptions.validators.identifier,
          wrappers: this.showIdentifierCreateButton
            ? ["panel", "button", "form-field"]
            : ["panel", "form-field"],
          updateOn: "change",
          className: "flex-3 ",
          expressions: {
            "props.hintStart": (field) => {
              const value = field.formControl.value;
              if (!value) return "";
              return `ISO-Abbildung: ${this.getFormattedIdentifier(value)}`;
            },
            "props.required": this.geodatasetOptions.dynamicRequired.identifier,
          },
          buttonConfig: {
            text: "Erzeuge Id",
            onClick: (buttonConfig, field) => {
              field.formControl.setValue(generateUUID());
              field.formControl.markAsDirty();
            },
          },
        }),
        this.addRepeatList(
          "spatialRepresentationType",
          "Digitale Repräsentation",
          {
            asSelect: true,
            showSearch: true,
            options: this.getCodelistForSelect(
              "526",
              "spatialRepresentationType",
            ),
            codelistId: "526",
            expressions: {
              "props.required":
                "formState.mainModel?.properties?.isInspireIdentified === 'conform'",
              className: "field.props.required ? '' : 'optional'",
            },
          },
        ),
        this.addRepeat("vectorSpatialRepresentation", "Vektorformat", {
          fields: [
            this.addSelectInline("topologyLevel", "Topologieinformation", {
              options: this.getCodelistForSelect("528", "topologyLevel"),
              codelistId: "528",
              showSearch: true,
            }),
            this.addSelectInline("geometricObjectType", "Geometrietyp", {
              options: this.getCodelistForSelect("515", "geometricObjectType"),
              codelistId: "515",
              showSearch: true,
              expressions: {
                "props.required": (field) =>
                  field.model?.geometricObjectCount != null,
              },
            }),
            this.addInputInline("geometricObjectCount", "Elementanzahl", {
              type: "number",
            }),
          ],
          expressions: {
            hide: '!formState.mainModel?.spatialRepresentationType?.find(x => x.key === "1")',
          },
        }),
        this.addGroup(
          "gridSpatialRepresentation",
          "Raster-/Gridformat",
          [
            this.addSelectInline("type", "Typ", {
              defaultValue: { key: "basis" },
              showSearch: true,
              allowNoValue: false,
              options: <SelectOptionUi[]>[
                {
                  value: "basis",
                  label: "Geobasisraster",
                },
                {
                  value: "rectified",
                  label: "Georektifiziertes Raster",
                },
                {
                  value: "referenced",
                  label: "Georeferenzierbares Raster",
                },
              ],
            }),
            this.addRepeat("axesDimensionProperties", null, {
              fields: [
                this.addSelectInline("name", "Achsenbezeichnung", {
                  options: this.getCodelistForSelect("514", "name"),
                  codelistId: "514",
                  required: true,
                  showSearch: true,
                }),
                this.addInputInline("size", "Elementanzahl", {
                  type: "number",
                  required: true,
                }),
                this.addInputInline("resolution", "Auflösung in Meter", {
                  type: "number",
                }),
              ],
              wrappers: [],
              addButtonTitle: "Dimensionseigenschaften hinzufügen",
            }),
            this.addGroup(
              null,
              null,
              [
                this.addCheckboxInline(
                  "transformationParameterAvailability",
                  "Verfügbarkeit von Transformationsparametern",
                  { className: "flex-2" },
                ),
                this.addInputInline(
                  "numberOfDimensions",
                  "Anzahl der Dimensionen",
                  {
                    type: "number",
                    expressions: {
                      "props.required": (field) =>
                        isNotEmptyObject(field.form.value, ["type"]),
                    },
                    hasInlineContextHelp: true,
                    wrappers: ["inline-help", "form-field"],
                  },
                ),
                this.addSelectInline("cellGeometry", "Zellengeometrie", {
                  options: this.getCodelistForSelect("509", "cellGeometry"),
                  codelistId: "509",
                  showSearch: true,
                  allowNoValue: true,
                  expressions: {
                    "props.required": (field) =>
                      isNotEmptyObject(field.form.value, ["type"]),
                  },
                  hasInlineContextHelp: true,
                  wrappers: ["inline-help", "form-field"],
                }),
              ],
              { wrappers: [] },
            ),
            this.addGroup(
              "georectified",
              null,
              [
                this.addGroup(
                  null,
                  null,
                  [
                    this.addCheckboxInline(
                      "checkPointAvailability",
                      "Kontrollpunktverfügbarkeit",
                      {
                        className: "flex-1",
                        hasInlineContextHelp: true,
                      },
                    ),
                    this.addInputInline(
                      "checkPointDescription",
                      "Kontrollpunktbeschreibung",
                      {
                        className: "flex-1",
                        hasInlineContextHelp: true,
                        wrappers: ["inline-help", "form-field"],
                      },
                    ),
                  ],
                  { wrappers: [] },
                ),
                this.addGroup(
                  null,
                  null,
                  [
                    this.addInputInline("cornerPoints", "Eckpunkte", {
                      className: "flex-3",
                      hasInlineContextHelp: true,
                      wrappers: ["inline-help", "form-field"],
                    }),
                    this.addSelectInline("pointInPixel", "Punkt im Pixel", {
                      options: this.getCodelistForSelect(
                        "2100",
                        "pointInPixel",
                      ),
                      codelistId: "2100",
                      showSearch: true,
                      className: "flex-3",
                      allowNoValue: true,
                      hasInlineContextHelp: true,
                      wrappers: ["inline-help", "form-field"],
                    }),
                  ],
                  { wrappers: [] },
                ),
              ],
              {
                wrappers: [],
                fieldGroupClassName: "",
                hideExpression:
                  'formState.mainModel?.gridSpatialRepresentation?.type?.key !== "rectified"',
              },
            ),
            this.addGroup(
              "georeferenceable",
              null,
              [
                this.addGroup(
                  null,
                  null,
                  [
                    this.addCheckboxInline(
                      "orientationParameterAvailability",
                      "Verfügbarkeit der Orientierungsparameter",
                      { className: "flex-3" },
                    ),
                    this.addCheckboxInline(
                      "controlPointAvaliability",
                      "Passpunktverfügbarkeit",
                      {
                        className: "flex-3",
                        hasInlineContextHelp: true,
                      },
                    ),
                  ],
                  { wrappers: [] },
                ),
                this.addInputInline(
                  "parameters",
                  "Georeferenzierungsparameter",
                  {
                    className: "",
                    hasInlineContextHelp: true,
                    wrappers: ["inline-help", "form-field"],
                  },
                ),
              ],
              {
                wrappers: [],
                fieldGroupClassName: "",
                hideExpression:
                  'formState.mainModel?.gridSpatialRepresentation?.type?.key !== "referenced"',
              },
            ),
          ],
          {
            fieldGroupClassName: "",
            hideExpression:
              '!formState.mainModel?.spatialRepresentationType?.find(x => x.key === "2")',
          },
        ),
        this.addResolutionFields(),
        this.addReferencesForAddress(
          "service.coupledResources",
          "uuid",
          "Darstellender Dienst",
          true,
          false,
          "Dieser Datensatz wurde von keinem Geodatendienst referenziert",
          "Die Referenz kann nur vom darstellenden Dienst entfernt werden",
          {
            className: "optional",
            contextHelpId: "coupledResources",
          },
        ),
        this.addGroupSimple("dataQualityInfo", [
          this.addGroupSimple("lineage", [
            this.addGroupSimple("source", [
              this.addRepeatDetailList(
                "descriptions",
                "Datengrundlage/Herkunft",
                {
                  required: true,
                  itemPreviewFields: {
                    category: (item) => {
                      let value = "";
                      if (item["_type"] == "freeDescription") {
                        value =
                          "Freie Beschreibung " + (item["identifier"] ?? "");
                      } else if (item["_type"] == "internalDataOrigin") {
                        value = "Geodatensatz " + item["uuidRef"];
                      } else if (item["_type"] == "externalDataOrigin") {
                        value = "Externe Referenz";
                      }
                      return of({ value, link: null });
                    },
                    title: (item) => {
                      if (item["_type"] == "internalDataOrigin") {
                        return this.documentService
                          .load(item["uuidRef"], false, false, true)
                          .pipe(
                            map((doc) => {
                              return {
                                value: doc?.document.title,
                                link: null,
                              };
                            }),
                          );
                      } else {
                        return of({
                          value: item["title"],
                          link: item["url"],
                        });
                      }
                    },
                    subtitle: (item) => {
                      const codelistKey = item["dateType"]?.["key"] ?? null;
                      let value: string = item["date"]
                        ? new Date(item["date"]).toLocaleDateString("de-DE")
                        : "";
                      if (codelistKey != null) {
                        this.codelistPipe
                          .transform(codelistKey, "502")
                          .subscribe((codelist) => {
                            value += " - " + codelist;
                          });
                      }
                      return of({
                        value,
                        link: null,
                      });
                    },
                    description: (item) => {
                      return of({
                        value: item["value"],
                        link: null,
                      });
                    },
                  },
                  _types: [
                    {
                      key: "internalDataOrigin",
                      value: "Geodatensatz",
                      icon: "Geodatensatz",
                    },
                    {
                      key: "externalDataOrigin",
                      value: "Externe Referenz",
                      icon: "circle-enable",
                    },
                    {
                      key: "freeDescription",
                      value: "Freie Beschreibung",
                      icon: "circle",
                    },
                  ],
                  fields: [
                    this.addTextAreaInline("value", "Beschreibung", null, {
                      required: true,
                      wrappers: ["inline-help", "form-field"],
                      hasInlineContextHelp: true,
                    }),
                    this.addGroupSimple(
                      null,
                      [
                        this.addDatepickerInline("date", null, {
                          fieldLabel: "Datum",
                          wrappers: ["inline-help", "form-field"],
                          expressions: {
                            "props.required": (field: FormlyFieldConfig) =>
                              field.form.value._type == "externalDataOrigin" ||
                              field.form.value._type == "internalDataOrigin" ||
                              !!field.form.value.title ||
                              !!field.form.value.identifier ||
                              !!field.form.value.dateType,
                          },
                        }),
                        this.addSelect("dateType", null, {
                          showSearch: true,
                          fieldLabel: "Typ",
                          wrappers: ["inline-help", "form-field"],
                          className: "flex-3",
                          options: this.getCodelistForSelect("502", "type"),
                          codelistId: "502",
                          expressions: {
                            "props.required": (field: FormlyFieldConfig) =>
                              field.form.value._type == "externalDataOrigin" ||
                              field.form.value._type == "internalDataOrigin" ||
                              !!field.form.value.title ||
                              !!field.form.value.identifier ||
                              !!field.form.value.date,
                          },
                        }),
                      ],
                      {
                        fieldGroupClassName: "flex-row gap-12",
                      },
                    ),
                    this.addDocumentCard("uuidRef", {
                      required: true,
                      docTypeFilter: ["InGridGeoDataset"],
                      label: "Geodatensatz auswählen",
                      allowRedirectToDocument: false,
                      allowMultiSelect: false,
                      titleOfDocumentSelectorDialog: "Geodatensatz auswählen",
                      expressions: {
                        hide: (field: FormlyFieldConfig) => {
                          return field.form.value._type != "internalDataOrigin";
                        },
                      },
                    }),
                    this.addGroupSimple(
                      null,
                      [
                        this.addInputInline("url", "URL", {
                          wrappers: ["inline-help", "form-field"],
                          className: "flex-3",
                          hasInlineContextHelp: true,
                          updateOn: "change",
                          validators: {
                            validation: ["url"],
                          },
                          expressions: {
                            hide: (field: FormlyFieldConfig) => {
                              return (
                                field.form.value._type != "externalDataOrigin"
                              );
                            },
                            "props.required": (field: FormlyFieldConfig) => {
                              return (
                                field.form.value._type == "externalDataOrigin"
                              );
                            },
                          },
                          validation: {
                            messages: {
                              required:
                                "URL oder Datensatzverweis muss ausgefüllt sein",
                            },
                          },
                        }),
                      ],
                      { fieldGroupClassName: "flex-row gap-12" },
                    ),
                    this.addInputInline("title", "Titel", {
                      wrappers: ["inline-help", "form-field"],
                      hasInlineContextHelp: true,
                      updateOn: "change",
                      expressions: {
                        hide: (field: FormlyFieldConfig) => {
                          return field.form.value._type == "internalDataOrigin";
                        },
                        "props.required": (field: FormlyFieldConfig) =>
                          field.form.value._type == "externalDataOrigin" ||
                          !!field.form.value.identifier ||
                          !!field.form.value.date ||
                          !!field.form.value.dateType,
                      },
                    }),
                    this.addInputInline("identifier", "Identifikator", {
                      wrappers: ["inline-help", "form-field"],
                      hasInlineContextHelp: true,
                      updateOn: "change",
                      validators: {
                        validation: ["url"],
                      },
                      expressions: {
                        hide: (field: FormlyFieldConfig) => {
                          return field.form.value._type == "internalDataOrigin";
                        },
                        "props.required": (field: FormlyFieldConfig) =>
                          field.form.value._type == "externalDataOrigin" ||
                          !!field.form.value.title ||
                          !!field.form.value.date ||
                          !!field.form.value.dateType,
                      },
                      validation: {
                        messages: {
                          required:
                            "URL oder Datensatzverweis muss ausgefüllt sein",
                        },
                      },
                    }),
                  ],
                },
              ),
              this.addGroupSimple("processStep", [
                this.addRepeatList("description", "Herstellungsprozess", {
                  className: "optional flex-1",
                  asAutocomplete: true,
                  contextHelpId: "processStep",
                }),
              ]),
            ]),
          ]),
        ]),
        this.addGroupSimple("portrayalCatalogueInfo", [
          this.addRepeat("citation", "Symbolkatalog", {
            className: "optional",
            fields: this.titleDateEditionFields("3555"),
          }),
        ]),
        this.addGroupSimple("featureCatalogueDescription", [
          this.addRepeat("citation", "Schlüsselkatalog", {
            fields: this.titleDateEditionFields("3535"),
            expressions: {
              "props.required": this.geodatasetOptions.dynamicRequired.citation,
              className: "field.props.required ? '' : 'optional'",
            },
            contextHelpId: "keyCatalog",
          }),
          this.addRepeatList("featureTypes", "Sachdaten/Attributinformation", {
            className: "optional",
            asAutocomplete: true,
          }),
        ]),
      ]),
      this.addSection("Datenqualität", [
        this.addGroupSimple("dataQuality", [
          this.addGroupSimple("completenessOmission", [
            this.addInput("measResult", "Datendefizit", {
              wrappers: ["panel", "form-field", "addons"],
              className: "single-field width-25 right-align",
              type: "number",
              min: 0,
              max: 100,
              suffix: {
                text: "%",
              },
            }),
          ]),
        ]),
        this.addGroup(
          "absoluteExternalPositionalAccuracy",
          "Genauigkeit",
          [
            this.addInput("griddedDataPositionalAccuracy", null, {
              fieldLabel: "Rasterpositionsgenauigkeit",
              type: "number",
              className: "optional right-align",
              expressions: {
                hide: '!formState.mainModel?.spatialRepresentationType?.find(x => x.key === "2")',
              },
              hasInlineContextHelp: true,
              wrappers: ["inline-help", "form-field", "addons"],
              suffix: {
                text: "m",
              },
            }),
            this.addInput("vertical", null, {
              fieldLabel: "Höhengenauigkeit",
              type: "number",
              hasInlineContextHelp: true,
              className: "right-align",
              wrappers: ["inline-help", "form-field", "addons"],
              suffix: {
                text: "m",
              },
            }),
            this.addInput("horizontal", null, {
              fieldLabel: "Lagegenauigkeit",
              type: "number",
              hasInlineContextHelp: true,
              className: "right-align",
              wrappers: ["inline-help", "form-field", "addons"],
              suffix: {
                text: "m",
              },
            }),
          ],
          { fieldGroupClassName: "flex-row" },
        ),
        this.addRepeat("qualities", "Qualitätsinformationen", {
          className: "optional",
          menuOptions: [
            {
              key: "completenessComission",
              value: "Datenüberschuss",
              fields: this.getQualityFields("7109"),
            },
            {
              key: "conceptualConsistency",
              value: "Konzeptionelle Konsistenz",
              fields: this.getQualityFields("7112"),
            },
            {
              key: "domainConsistency",
              value: "Konsistenz des Wertebereichs",
              fields: this.getQualityFields("7113"),
            },
            {
              key: "formatConsistency",
              value: "Formatkonsistenz",
              fields: this.getQualityFields("7114"),
            },
            {
              key: "topologicalConsistency",
              value: "Topologische Konsistenz",
              fields: this.getQualityFields("7115"),
            },
            {
              key: "temporalConsistency",
              value: "Zeitliche Konsistenz",
              fields: this.getQualityFields("7120"),
            },
            {
              key: "thematicClassificationCorrectness",
              value: "Korrektheit der thematischen Klassifizierung",
              fields: this.getQualityFields("7125"),
            },
            {
              key: "nonQuantitativeAttributeAccuracy",
              value: "Genauigkeit nicht-quantitativer Attribute",
              fields: this.getQualityFields("7126"),
            },
            {
              key: "quantitativeAttributeAccuracy",
              value: "Genauigkeit quantitativer Attribute",
              fields: this.getQualityFields("7127"),
            },
            {
              key: "relativeInternalPositionalAccuracy",
              value: "Relative Positionsgenauigkeit",
              fields: this.getQualityFields("7128"),
            },
          ],
        }),
      ]),

      this.addSpatialSection(),
      this.addTimeReferenceSection(),
      this.addAdditionalInformationSection({
        extraInfoCharSetData: true,
        conformity: true,
        extraInfoLangData: true,
      }),
      this.addAvailabilitySection(),
      this.addLinksSection(),
      this.addFileReferences(),
    ];

    return this.manipulateDocumentFields(fields);
  };

  private getQualityFields(codelistId: string) {
    return this.addGroupSimple(
      null,
      [
        { key: "_type" },
        this.addAutoCompleteInline("measureType", "Art der Messung", {
          required: true,
          options: this.getCodelistForSelect(codelistId, "measureType"),
          codelistId: codelistId,
          className: "flex-2",
        }),
        this.addInputInline("value", "Ergebnis", {
          required: true,
          type: "number",
        }),
        this.addInputInline("parameter", "Beschreibung"),
      ],
      { fieldGroupClassName: "flex-row" },
    );
  }

  private getFormattedIdentifier(fieldValue: String) {
    const currentCatalog = this.configService.$userInfo.value.currentCatalog;
    const namespace =
      currentCatalog.settings.config?.namespace?.trim() ||
      `https://registry.gdi-de.org/id/${currentCatalog.id}/`;
    return fieldValue?.includes("://")
      ? fieldValue
      : `${namespace}${fieldValue}`;
  }
}
