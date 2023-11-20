import { SelectOptionUi } from "../../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { IngridShared } from "./ingrid-shared";
import { isNotEmptyObject } from "../../../app/shared/utils";
import { generateUUID } from "../../../app/services/utils";

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
    },
  };

  showInspireConform = true;
  isGeoDataset = true;

  documentFields = () => {
    this.handleInVeKoSBehaviour();

    const fields = <FormlyFieldConfig[]>[
      this.addGeneralSection({
        inspireRelevant: true,
        advCompatible: true,
        openData: true,
        thesaurusTopics: true,
        additionalGroup: this.addSelect("subType", "Datensatz/Datenserie", {
          required: this.geodatasetOptions.required.subType,
          showSearch: true,
          options: this.getCodelistForSelect(525, "subType"),
          codelistId: 525,
        }),
      }),
      this.addKeywordsSection({
        priorityDataset: true,
        spatialScope: true,
        thesaurusTopics: true,
        inspireTopics: true,
        advProductGroup: true,
      }),

      this.addSection("Fachbezug", [
        this.addGroupSimple("lineage", [
          this.addTextArea("statement", "Fachliche Grundlage", this.id, {
            required: this.geodatasetOptions.required.statement,
          }),
        ]),
        this.addInput("identifier", "Identifikator der Datenquelle", {
          required: this.geodatasetOptions.required.identifier,
          wrappers: ["panel", "button", "form-field"],
          className: "flex-3 ",
          expressions: {
            "props.hintStart": (field) => {
              const value = field.formControl.value;
              if (!value) return "";
              const currentCatalog =
                this.configService.$userInfo.value.currentCatalog;
              const namespace =
                this.addSuffix(currentCatalog.settings.config?.namespace) ??
                `https://registry.gdi-de.org/id/${currentCatalog.id}/`;
              return value?.indexOf("://") >= 0
                ? ""
                : "ISO-Abbildung: " + namespace + value;
            },
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
            options: this.getCodelistForSelect(526, "priorityDataset"),
            codelistId: 526,
            expressions: {
              "props.required": "formState.mainModel?.isInspireConform",
              className: "field.props.required ? '' : 'optional'",
            },
          },
        ),
        this.addRepeat("vectorSpatialRepresentation", "Topologieinformation", {
          fields: [
            this.addSelectInline("topologyLevel", "Topologieinformation", {
              options: this.getCodelistForSelect(528, "topologyLevel"),
              codelistId: 528,
              showSearch: true,
            }),
            this.addSelectInline("geometricObjectType", "Geometrietyp", {
              options: this.getCodelistForSelect(515, "geometricObjectType"),
              codelistId: 515,
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
          "Raster/Gridformat",
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
                  options: this.getCodelistForSelect(514, "name"),
                  codelistId: 514,
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
                  options: this.getCodelistForSelect(509, "cellGeometry"),
                  codelistId: 509,
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
                      options: this.getCodelistForSelect(2100, "pointInPixel"),
                      codelistId: 2100,
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
              this.addRepeatList("descriptions", "Datengrundlage", {
                className: "optional flex-1",
                asAutocomplete: true,
              }),
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
            fields: this.titleDateEditionFields(3555),
          }),
        ]),
        this.addGroupSimple("featureCatalogueDescription", [
          this.addRepeat("citation", "Schlüsselkatalog", {
            fields: this.titleDateEditionFields(3535),
            expressions: {
              "props.required": this.geodatasetOptions.dynamicRequired.citation,
              className: "field.props.required ? '' : 'optional'",
            },
            contextHelpId: "citation_2",
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
              fields: this.getQualityFields(7109),
            },
            {
              key: "conceptualConsistency",
              value: "Konzeptionelle Konsistenz",
              fields: this.getQualityFields(7112),
            },
            {
              key: "domainConsistency",
              value: "Konsistenz des Wertebereichs",
              fields: this.getQualityFields(7113),
            },
            {
              key: "formatConsistency",
              value: "Formatkonsistenz",
              fields: this.getQualityFields(7114),
            },
            {
              key: "topologicalConsistency",
              value: "Topologische Konsistenz",
              fields: this.getQualityFields(7115),
            },
            {
              key: "temporalConsistency",
              value: "Zeitliche Genauigkeit",
              fields: this.getQualityFields(7120),
            },
            {
              key: "thematicClassificationCorrectness",
              value: "Korrektheit der thematischen Klassifizierung",
              fields: this.getQualityFields(7125),
            },
            {
              key: "nonQuantitativeAttributeAccuracy",
              value: "Genauigkeit nicht-quantitativer Attribute",
              fields: this.getQualityFields(7126),
            },
            {
              key: "quantitativeAttributeAccuracy",
              value: "Genauigkeit quantitativer Attribute",
              fields: this.getQualityFields(7127),
            },
            {
              key: "relativeInternalPositionalAccuracy",
              value: "Relative Positionsgenauigkeit",
              fields: this.getQualityFields(7128),
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
    ];

    return this.manipulateDocumentFields(fields);
  };

  private getQualityFields(codelistId: number) {
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

  private addSuffix(url: string) {
    if (!url) {
      return url;
    }
    if (url?.endsWith("/") == true) {
      return url;
    }
    return url + "/";
  }
}
