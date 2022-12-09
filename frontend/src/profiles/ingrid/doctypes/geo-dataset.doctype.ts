import {
  CodelistService,
  SelectOptionUi,
} from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { IngridShared } from "./ingrid-shared";
import { UploadService } from "../../../app/shared/upload/upload.service";
import { isEmptyObject } from "../../../app/shared/utils";

const qualityTables = <SelectOptionUi[]>[
  { label: "Datenüberschuss", value: "completenessComission" },
  { label: "Konzeptionelle Konsistenz", value: "conceptualConsistency" },
  { label: "Konsistenz des Wertebereichs", value: "domainConsistency" },
  { label: "Formatkonsistenz", value: "formatConsistency" },
  { label: "Topologische Konsistenz", value: "topologicalConsistency" },
  { label: "Zeitliche Genauigkeit", value: "temporalConsistency" },
  {
    label: "Korrektheit der thematischen Klassifizierung",
    value: "thematicClassificationCorrectness",
  },
  {
    label: "Genauigkeit nicht-quantitativer Attribute",
    value: "nonQuantitativeAttributeAccuracy",
  },
  {
    label: "Genauigkeit quantitativer Attribute",
    value: "quantitativeAttributeAccuracy",
  },
  {
    label: "Relative Positionsgenauigkeit",
    value: "relativeInternalPositionalAccuracy",
  },
];

@Injectable({
  providedIn: "root",
})
export class GeoDatasetDoctype extends IngridShared {
  id = "InGridGeoDataset";

  label = "Geodatensatz";

  iconClass = "Geodatensatz";

  hasOptionalFields = true;

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addGeneralSection({
        inspireRelevant: true,
        openData: true,
        additionalGroup: this.addSelect("subType", "Datensatz/Datenserie", {
          required: true,
          options: this.getCodelistForSelect(525, "subType"),
          codelistId: 525,
        }),
      }),
      this.addKeywordsSection({
        priorityDataset: true,
        spatialScope: true,
        thesaurusTopics: true,
      }),

      this.addSection("Fachbezug", [
        // this.addGroupSimple("lineage", [
        this.addRepeat("lineage", "Fachliche Grundlage", {
          required: true,
          defaultValue: [{ _type: "information" }],
          menuOptions: [
            {
              key: "information",
              value: "Information",
              fields: this.addGroupSimple(null, [
                { key: "_type" },
                this.addTextAreaInline(
                  "statement",
                  "Fachliche Grundlage",
                  this.id,
                  { className: "" }
                ),
              ]),
            },
            { key: "url", value: "Verweise", fields: this.urlRefFields() },
          ],
          fields: [],
        }),

        this.addInput("identifier", "Identifikator der Datenquelle", {
          required: true,
          wrappers: ["panel", "form-field"],
        }),
        this.addRepeatList(
          "spatialRepresentationType",
          "Digitale Repräsentation",
          {
            asSelect: true,
            options: this.getCodelistForSelect(526, "priorityDataset"),
            codelistId: 526,
            expressions: { hide: "formState.hideOptionals" },
          }
        ),
        this.addTable("vectorSpatialRepresentation", "Topologieinformation", {
          supportUpload: false,
          columns: [
            {
              key: "topologyLevel",
              type: "select",
              label: "Topologieinformation",
              props: {
                label: "Topologieinformation",
                appearance: "outline",
                options: this.getCodelistForSelect(528, "topologyLevel"),
                codelistId: 528,
                formatter: (item: any) => this.formatCodelistValue("528", item),
              },
            },
            {
              key: "geometricObjectType",
              type: "select",
              label: "Geometrietyp",
              props: {
                label: "Geometrietyp",
                appearance: "outline",
                options: this.getCodelistForSelect(515, "geometricObjectType"),
                codelistId: 515,
                formatter: (item: any) => this.formatCodelistValue("515", item),
              },
            },
            {
              key: "geometricObjectCount",
              type: "input",
              label: "Elementanzahl",
              props: {
                label: "Elementanzahl",
                type: "number",
                appearance: "outline",
              },
            },
          ],
          expressions: {
            hide: '!formState.mainModel.spatialRepresentationType?.find(x => x.key === "1")',
          },
        }),
        this.addGroup(
          "gridSpatialRepresentation",
          "Raster/Gitter",
          [
            this.addSelectInline("type", "Typ", {
              defaultValue: { key: "basis" },
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
            this.addRepeat("axisDimensionsProperties", null, {
              fields: [
                this.addSelectInline("name", "Achsenbezeichnung", {
                  options: this.getCodelistForSelect(514, "name"),
                  codelistId: 514,
                  required: true,
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
            }),
            this.addGroup(
              null,
              null,
              [
                this.addCheckboxInline(
                  "transformationParameterAvailability",
                  "Verfügbarkeit von Transformationsparametern",
                  { className: "flex-2" }
                ),
                this.addInputInline(
                  "numberOfDimenstions",
                  "Anzahl der Dimensionen",
                  {
                    type: "number",
                    expressions: {
                      "props.required": (field) =>
                        isEmptyObject(field.form.value, ["type"]),
                    },
                  }
                ),
                this.addSelectInline("cellGeometry", "Zellengeometrie", {
                  options: this.getCodelistForSelect(509, "cellGeometry"),
                  codelistId: 509,
                  allowNoValue: true,
                  expressions: {
                    "props.required": (field) =>
                      isEmptyObject(field.form.value, ["type"]),
                  },
                }),
              ],
              { wrappers: [] }
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
                      { className: "flex-1" }
                    ),
                    this.addInputInline(
                      "checkPointDescription",
                      "Kontrollpunktbeschreibung",
                      { className: "flex-1" }
                    ),
                  ],
                  { wrappers: [] }
                ),
                this.addGroup(
                  null,
                  null,
                  [
                    this.addInputInline("cornerPoints", "Eckpunkte", {
                      className: "flex-3",
                    }),
                    this.addSelectInline("pointInPixel", "Punkt im Pixel", {
                      options: this.getCodelistForSelect(2100, "pointInPixel"),
                      codelistId: 2100,
                      className: "flex-3",
                      allowNoValue: true,
                    }),
                  ],
                  { wrappers: [] }
                ),
              ],
              {
                wrappers: [],
                fieldGroupClassName: "",
                hideExpression:
                  'formState.mainModel.gridSpatialRepresentation?.type?.key !== "rectified"',
              }
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
                      { className: "flex-3" }
                    ),
                    this.addCheckboxInline(
                      "controlPointAvaliability",
                      "Passpunktverfügbarkeit",
                      { className: "flex-3" }
                    ),
                  ],
                  { wrappers: [] }
                ),
                this.addInputInline(
                  "parameters",
                  "Georeferenzierungsparameter",
                  { className: "" }
                ),
              ],
              {
                wrappers: [],
                fieldGroupClassName: "",
                hideExpression:
                  'formState.mainModel.gridSpatialRepresentation?.type?.key !== "referenced"',
              }
            ),
          ],
          {
            fieldGroupClassName: "",
            hideExpression:
              '!formState.mainModel.spatialRepresentationType?.find(x => x.key === "2")',
          }
        ),
        this.addRepeat("resolution", "Erstellungsmaßstab", {
          expressions: { hide: "formState.hideOptionals" },
          fields: [
            this.addInputInline("equivalentScale", "Maßstab 1:x", {
              type: "number",
            }),
            this.addInputInline("distanceMeter", "Bodenauflösung (m)", {
              type: "number",
            }),
            this.addInputInline("distanceDPI", "Scanauflösung (DPI)", {
              type: "number",
            }),
          ],
        }),
        this.addGroupSimple("portrayalCatalogueInfo", [
          this.addRepeat("citation", "Symbolkatalog", {
            menuOptions: [
              {
                key: "information",
                value: "Information",
                fields: this.titleDateEditionFields(3555),
              },
              { key: "url", value: "Verweise", fields: this.urlRefFields() },
            ],
            fields: [],
          }),
        ]),
        this.addGroupSimple("featureCatalogueDescription", [
          this.addRepeat("citation", "Schlüsselkatalog", {
            menuOptions: [
              {
                key: "information",
                value: "Information",
                fields: this.titleDateEditionFields(3535),
              },
              { key: "url", value: "Verweise", fields: this.urlRefFields() },
            ],
            fields: [],
            expressions: {
              "props.required":
                "formState.mainModel.featureCatalogueDescription?.featureTypes?.length > 0",
            },
          }),
          this.addRepeatList("featureTypes", "Sachdaten/Attributinformation", {
            expressions: { hide: "formState.hideOptionals" },
          }),
        ]),
        this.addRepeatList("coupledServices", "Darstellender Dienst", {
          expressions: { hide: "formState.hideOptionals" },
        }),
        this.addGroupSimple("dataQualityInfo", [
          this.addGroupSimple("lineage", [
            this.addRepeat("source", "Datengrundlage", {
              menuOptions: [
                {
                  key: "information",
                  value: "Information",
                  fields: this.addGroupSimple(null, [
                    { key: "_type" },
                    this.addInputInline("descriptions", "Information", {
                      expressions: { hide: "formState.hideOptionals" },
                      className: "",
                    }),
                  ]),
                },
                { key: "url", value: "Verweise", fields: this.urlRefFields() },
              ],
              fields: [],
            }),
            this.addRepeat("processStep", "Herstellungsprozess", {
              menuOptions: [
                {
                  key: "information",
                  value: "Information",
                  fields: this.addGroupSimple(null, [
                    { key: "_type" },
                    this.addTextAreaInline(
                      "description",
                      "Information",
                      this.id,
                      {
                        className: "",
                        expressions: { hide: "formState.hideOptionals" },
                      }
                    ),
                  ]),
                },
                { key: "url", value: "Verweise", fields: this.urlRefFields() },
              ],
              fields: [],
            }),
          ]),
        ]),
      ]),
      this.addSection("Datenqualität", [
        this.addGroupSimple("dataQuality", [
          this.addGroupSimple("completenessOmission", [
            this.addInput("measResult", "Datendefizit", {
              wrappers: ["panel", "form-field"],
              type: "number",
            }),
          ]),
          this.addGroup(
            "absoluteExternalPositionalAccuracy",
            "Genauigkeit",
            [
              this.addInput("griddedDataPositionalAccuracy", null, {
                fieldLabel: "Rasterpositionsgenauigkeit (m)",
                type: "number",
                expressions: {
                  hide: 'formState.hideOptionals || !formState.mainModel.spatialRepresentationType?.find(x => x.key === "2")',
                },
              }),
              this.addInput("vertical", null, {
                fieldLabel: "Höhengenauigkeit (m)",
                type: "number",
                hasInlineContextHelp: true,
                wrappers: ["form-field", "inline-help"],
              }),
              this.addInput("horizontal", null, {
                fieldLabel: "Lagegenauigkeit (m)",
                type: "number",
                hasInlineContextHelp: true,
                wrappers: ["form-field", "inline-help"],
              }),
            ],
            { fieldGroupClassName: "display-flex" }
          ),
          this.addTable("qualities", "Qualität", {
            supportUpload: false,
            expressions: { hide: "formState.hideOptionals" },
            columns: [
              {
                key: "type",
                type: "select",
                label: "Typ",
                width: "300px",
                props: {
                  label: "Typ",
                  appearance: "outline",
                  options: qualityTables,
                  formatter: (item: any) =>
                    qualityTables.find((qt) => qt.value === item.key).label,
                },
              },
              {
                key: "measureType",
                type: "select",
                label: "Art der Messung",
                width: "300px",
                props: {
                  label: "Art der Messung",
                  appearance: "outline",
                  options: this.getCodelistForSelect(
                    7109,
                    "extraInfoLangMetaData"
                  ),
                  codelistId: 7109, // TODO: codelistId changes for each type!
                  formatter: (item: any) =>
                    this.formatCodelistValue("7109", item),
                },
              },
              {
                key: "value",
                type: "input",
                label: "Wert",
                width: "300px",
                props: {
                  label: "Wert",
                  appearance: "outline",
                },
              },
              {
                key: "parameter",
                type: "input",
                label: "Parameter",
                width: "300px",
                props: {
                  label: "Parameter",
                  appearance: "outline",
                },
              },
            ],
          }),
        ]),
      ]),

      this.addSpatialSection({ regionKey: true }),
      this.addTimeReferenceSection(),
      this.addAdditionalInformationSection({
        extraInfoCharSetData: true,
        conformity: true,
        extraInfoLangData: true,
      }),
      this.addAvailabilitySection(),
      this.addLinksSection(),
    ];

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    uploadService: UploadService
  ) {
    super(codelistService, codelistQuery, uploadService);
  }
}
