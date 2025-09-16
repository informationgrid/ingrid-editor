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
import { SelectOptionUi } from "../../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { IngridClass, IngridShared } from "./ingrid-shared";
import { isNotEmptyObject } from "../../../app/shared/utils";
import { generateUUID } from "../../../app/services/utils";
import { map } from "rxjs/operators";
import {
  MetadataOption,
  MetadataOptionItem,
} from "../../../app/formly/types/metadata-type/metadata-type.component";
import { dataOrigin } from "./geo-dataset.dataOrigin";

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
      citation: (field: FormlyFieldConfig) =>
        field.options.formState.mainModel?.featureCatalogueDescription
          ?.featureTypes?.length > 0,
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
  showDataQualitySection = true;
  isGeoDataset = true;

  constructor() {
    super();
    this.options.dynamicRequired.spatialSystems = () => true;
    this.options.required.useConstraints = true;
    this.options.required.extraInfoLangData = true;
    this.options.dynamicRequired.dataFormat = (field: FormlyFieldConfig) =>
      field.options.formState.mainModel?.properties?.isInspireIdentified;
    this.options.dynamicRequired.spatialScope = (field: FormlyFieldConfig) =>
      field.options.formState.mainModel?.properties?.isInspireIdentified;
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
                    value: {
                      key: item.value,
                      value: item.label,
                      _codelistId: "525",
                    },
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
    this.handleDoiBehaviour();

    const fields = <FormlyFieldConfig[]>[
      this.addGeneralSection({
        thesaurusTopics: true,
      }),
      this.addKeywordsSection({
        priorityDataset: true,
        spatialScope: true,
        thesaurusTopics: true,
        inspireTopics: true,
      }),

      this.addSection(
        "Fachbezug",
        [
          this.addGroupSimple("lineage", [
            this.addTextArea(
              "statement",
              this.transloco.translate("form.statement"),
              this.id,
              {
                required: this.geodatasetOptions.required.statement,
                expressions: {
                  "props.required":
                    this.geodatasetOptions.dynamicRequired.statement,
                },
              },
            ),
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
              "props.hintStart": (field: FormlyFieldConfig) => {
                const value = field.formControl.value;
                if (!value) return "";
                return `ISO-Abbildung: ${this.getFormattedIdentifier(value)}`;
              },
              "props.required":
                this.geodatasetOptions.dynamicRequired.identifier,
            },
            buttonConfig: {
              text: "Erzeuge Id",
              onClick: (_, field: FormlyFieldConfig) => {
                field.formControl.setValue(generateUUID());
                field.formControl.markAsDirty();
              },
            },
          }),
          this.showDoiFields
            ? this.addGroupSimple("publication", [this.addDoiFields()])
            : null,
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
                "props.required": (field: FormlyFieldConfig) =>
                  field.options.formState.mainModel?.properties
                    ?.isInspireIdentified === "conform",
                className: (field: FormlyFieldConfig) =>
                  field.props.required ? "" : "optional",
              },
            },
          ),
          this.addRepeat("vectorSpatialRepresentation", "Vektorformat", {
            fields: [
              this.addSelectInline("topologyLevel", "Topologieinformation", {
                options: this.getCodelistForSelect(
                  "528",
                  "vectorSpatialRepresentation.topologyLevel",
                ),
                codelistId: "528",
                showSearch: true,
              }),
              this.addSelectInline("geometricObjectType", "Geometrietyp", {
                options: this.getCodelistForSelect(
                  "515",
                  "vectorSpatialRepresentation.geometricObjectType",
                ),
                codelistId: "515",
                showSearch: true,
                expressions: {
                  "props.required": (field: FormlyFieldConfig) =>
                    field.model?.geometricObjectCount != null,
                },
              }),
              this.addInputInline("geometricObjectCount", "Elementanzahl", {
                type: "number",
              }),
            ],
            expressions: {
              hide: (field: FormlyFieldConfig) =>
                !field.options.formState.mainModel?.spatialRepresentationType?.find(
                  (x) => x.key === "1",
                ),
            },
          }),
          this.addGroup(
            "gridSpatialRepresentation",
            "Raster-/Gridformat",
            [
              this.addSelectInline("type", "Typ", {
                // defaultValue: { key: "basis" },
                showSearch: true,
                allowNoValue: true,
                codelistId: null,
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
              this.addGroupSimple(
                null,
                [
                  this.addRepeat("axesDimensionProperties", null, {
                    fields: [
                      this.addSelectInline("name", "Achsenbezeichnung", {
                        options: this.getCodelistForSelect(
                          "514",
                          "gridSpatialRepresentation.axesDimensionProperties.name",
                        ),
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
                            "props.required": (field: FormlyFieldConfig) =>
                              isNotEmptyObject(field.form.value, ["type"]),
                          },
                          hasInlineContextHelp: true,
                          wrappers: ["inline-help", "form-field"],
                        },
                      ),
                      this.addSelectInline("cellGeometry", "Zellengeometrie", {
                        options: this.getCodelistForSelect(
                          "509",
                          "gridSpatialRepresentation.cellGeometry",
                        ),
                        codelistId: "509",
                        showSearch: true,
                        allowNoValue: true,
                        expressions: {
                          "props.required": (field: FormlyFieldConfig) =>
                            isNotEmptyObject(field.form.value, ["type"]),
                        },
                        hasInlineContextHelp: true,
                        wrappers: ["inline-help", "form-field"],
                      }),
                    ],
                    { wrappers: [] },
                  ),
                ],
                {
                  hideExpression: (field: FormlyFieldConfig) =>
                    field.options.formState.mainModel?.gridSpatialRepresentation
                      ?.type?.key !== "basis",
                },
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
                          "gridSpatialRepresentation.georectified.pointInPixel",
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
                  hideExpression: (field: FormlyFieldConfig) =>
                    field.options.formState.mainModel?.gridSpatialRepresentation
                      ?.type?.key !== "rectified",
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
                  hideExpression: (field: FormlyFieldConfig) =>
                    field.options.formState.mainModel?.gridSpatialRepresentation
                      ?.type?.key !== "referenced",
                },
              ),
            ],
            {
              fieldGroupClassName: "",
              hideExpression: (field: FormlyFieldConfig) =>
                !field.options.formState.mainModel?.spatialRepresentationType?.find(
                  (x) => x.key === "2",
                ),
            },
          ),
          this.addResolutionFields(),
          this.addIncomingReferences(
            "Darstellender Dienst",
            true,
            false,
            "Dieser Datensatz wird von keinem Geodatendienst referenziert.",
            "Die Referenz kann nur vom darstellenden Dienst entfernt werden.",
            {
              className: "optional",
              contextHelpId: "coupledResources",
              queryOptions: ["onlyInCoupledResources"],
            },
          ),
          this.addGroupSimple("dataQualityInfo", [
            this.addGroupSimple("lineage", [
              this.addGroupSimple("source", [
                dataOrigin(this, this.documentService),
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
              fields: this.titleDateEditionFields(
                "3555",
                "portrayalCatalogueInfo.",
              ),
            }),
          ]),
          this.addGroupSimple("featureCatalogueDescription", [
            this.addRepeat("citation", "Schlüsselkatalog", {
              fields: this.titleDateEditionFields(
                "3535",
                "featureCatalogueDescription.",
              ),
              expressions: {
                "props.required":
                  this.geodatasetOptions.dynamicRequired.citation,
                className: (field: FormlyFieldConfig) =>
                  field.props.required ? "" : "optional",
              },
              contextHelpId: "keyCatalog",
            }),
            this.addRepeatList(
              "featureTypes",
              "Sachdaten/Attributinformation",
              {
                className: "optional",
                asAutocomplete: true,
              },
            ),
          ]),
        ].filter(Boolean),
      ),
      this.showDataQualitySection
        ? this.addSection("Datenqualität", [
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
                    hide: (field: FormlyFieldConfig) =>
                      !field.options.formState.mainModel?.spatialRepresentationType?.find(
                        (x) => x.key === "2",
                      ),
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
          ])
        : null,
      this.addSpatialSection(),
      this.addTimeReferenceSection(),
      this.addAdditionalInformationSection({
        extraInfoCharSetData: true,
        conformity: true,
        extraInfoLangData: true,
      }),
      this.addAvailabilitySection(),
      this.addLinksSection(IngridClass.InGridGeoDataset),
      this.addFileReferences(),
    ].filter(Boolean);

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
