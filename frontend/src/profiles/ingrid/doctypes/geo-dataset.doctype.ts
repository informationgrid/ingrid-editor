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

const qualityTables = <SelectOptionUi[]>[
  { label: "Datenüberschuss", value: "dü" },
  { label: "Konzeptionelle Konsistenz", value: "kk" },
  { label: "Konsistenz des Wertebereichs", value: "kw" },
  { label: "Formatkonsistenz", value: "fk" },
  { label: "Topologische Konsistenz", value: "tk" },
  { label: "Zeitliche Genauigkeit", value: "zk" },
  {
    label: "Korrektheit der thematischen Klassifizierung",
    value: "ktk",
  },
  {
    label: "Genauigkeit nicht-quantitativer Attribute",
    value: "gnqa",
  },
  {
    label: "Genauigkeit quantitativer Attribute",
    value: "gqa",
  },
  { label: "Relative Positionsgenauigkeit", value: "rp" },
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
      this.addGeneralSection({ inspireRelevant: true, openData: true }),
      this.addKeywordsSection({
        priorityDataset: true,
        spatialScope: true,
        thesaurusTopics: true,
      }),

      this.addSection("Fachbezug", [
        this.addGroupSimple("lineage", [
          this.addTextArea("statement", "Fachliche Grundlage", this.id),
        ]),
        this.addInput("identifier", "Identifikator der Datenquelle", {
          required: true,
          wrappers: ["panel", "form-field"],
        }),
        this.addSelect("subType", "Datensatz/Datenserie", {
          required: true,
          options: this.getCodelistForSelect(525, "subType"),
          codelistId: 525,
        }),
        this.addRepeatList(
          "spatialRepresentationType",
          "Digitale Repräsentation",
          {
            asSelect: true,
            options: this.getCodelistForSelect(526, "priorityDataset"),
            codelistId: 526,
            hideExpression: "formState.hideOptionals",
          }
        ),
        this.addTable("vectorSpatialRepresentation", "Topologieinformation", {
          supportUpload: false,
          columns: [
            {
              key: "topologyLevel",
              type: "select",
              label: "Topologieinformation",
              templateOptions: {
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
              templateOptions: {
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
              templateOptions: {
                label: "Elementanzahl",
                type: "number",
                appearance: "outline",
              },
            },
          ],
          hideExpression:
            'formState.mainModel.spatialRepresentationType.find(x => x.key === "1") === undefined',
        }),
        this.addGroup(
          "gridSpatialRepresentation",
          "Raster/Gitter",
          [
            this.addGroup(
              null,
              null,
              [
                this.addCheckboxInline(
                  "transformationParameterAvailability",
                  "Verfügbarkeit von Transformationsparametern",
                  { className: "flex-3" }
                ),
                this.addInputInline(
                  "numberOfDimenstions",
                  "Anzahl der Dimensionen"
                ),
                this.addInputInline("cellGeometry", "Zellengeometrie"),
              ],
              { wrappers: [] }
            ),
            this.addGroup(
              null,
              null,
              [
                this.addTable("axisDimensionsProperties", null, {
                  supportUpload: false,
                  className: "flex-1",
                  columns: [
                    {
                      key: "name",
                      type: "input",
                      label: "Achsenbezeichnung",
                      templateOptions: {
                        label: "Achsenbezeichnung",
                        appearance: "outline",
                        options: this.getCodelistForSelect(
                          514,
                          "geometricObjectType"
                        ),
                        codelistId: 514,
                        formatter: (item: any) =>
                          this.formatCodelistValue("514", item),
                      },
                    },
                    {
                      key: "size",
                      type: "input",
                      label: "Elementanzahl",
                      templateOptions: {
                        label: "Elementanzahl",
                        type: "number",
                        appearance: "outline",
                      },
                    },
                    {
                      key: "resolution",
                      type: "input",
                      label: "Auflösung in Meter",
                      templateOptions: {
                        label: "Auflösung in Meter",
                        type: "number",
                        appearance: "outline",
                      },
                    },
                  ],
                }),
              ],
              { wrappers: [] }
            ),
            this.addSelectInline("type", "Typ", {
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
                      { className: "flex-3" }
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
                    }),
                  ],
                  { wrappers: [] }
                ),
              ],
              {
                wrappers: [],
                fieldGroupClassName: "",
                hideExpression:
                  'formState.mainModel.gridSpatialRepresentation.type?.key !== "rectified"',
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
                  "Georeferenzierungsparameter"
                ),
              ],
              {
                wrappers: [],
                fieldGroupClassName: "",
                hideExpression:
                  'formState.mainModel.gridSpatialRepresentation.type?.key !== "referenced"',
              }
            ),
          ],
          {
            fieldGroupClassName: "",
            hideExpression:
              'formState.mainModel.spatialRepresentationType.find(x => x.key === "2") === undefined',
          }
        ),
        this.addTable("resolution", "Erstellungsmaßstab", {
          supportUpload: false,
          hideExpression: "formState.hideOptionals",
          columns: [
            {
              key: "equivalentScale",
              type: "input",
              label: "Maßstab 1:x",
              templateOptions: {
                type: "number",
                label: "Maßstab 1:x",
                appearance: "outline",
              },
            },
            {
              key: "distanceMeter",
              type: "input",
              label: "Bodenauflösung (m)",
              width: "300px",
              templateOptions: {
                type: "number",
                label: "Bodenauflösung (m)",
                appearance: "outline",
              },
            },
            {
              key: "distanceDPI",
              type: "input",
              label: "Scanauflösung (DPI)",
              width: "300px",
              templateOptions: {
                type: "number",
                label: "Scanauflösung (DPI)",
                appearance: "outline",
              },
            },
          ],
        }),
        this.addGroup(
          "portrayalCatalogueInfo",
          null,
          [
            this.addTable("citation", "Symbolkatalog", {
              supportUpload: false,
              hideExpression: "formState.hideOptionals",
              columns: [
                {
                  key: "title",
                  type: "input",
                  label: "Titel",
                  templateOptions: {
                    required: true,
                    label: "Titel",
                    appearance: "outline",
                  },
                },
                {
                  key: "date",
                  type: "datepicker",
                  label: "Datum",
                  width: "300px",
                  templateOptions: {
                    required: true,
                    label: "Datum",
                    appearance: "outline",
                    formatter: (date: Date) => {
                      return new Date(date).toLocaleDateString();
                    },
                  },
                },
                {
                  key: "edition",
                  type: "input",
                  label: "Version",
                  width: "300px",
                  templateOptions: {
                    label: "Version",
                    appearance: "outline",
                  },
                },
              ],
            }),
          ],
          { fieldGroupClassName: "", wrappers: [] }
        ),
        this.addGroupSimple("featureCatalogueDescription", [
          this.addTable("citation", "Schlüsselkatalog", {
            supportUpload: false,
            hideExpression: "formState.hideOptionals",
            columns: [
              {
                key: "title",
                type: "input",
                label: "Titel",
                templateOptions: {
                  required: true,
                  label: "Titel",
                  appearance: "outline",
                },
              },
              {
                key: "date",
                type: "datepicker",
                label: "Datum",
                width: "300px",
                templateOptions: {
                  required: true,
                  label: "Datum",
                  appearance: "outline",
                  formatter: (date: Date) => {
                    return new Date(date).toLocaleDateString();
                  },
                },
              },
              {
                key: "version",
                type: "input",
                label: "Version",
                width: "300px",
                templateOptions: {
                  label: "Version",
                  appearance: "outline",
                },
              },
            ],
          }),
          this.addRepeatList("featureTypes", "Sachdaten/Attributinformation", {
            hideExpression: "formState.hideOptionals",
          }),
        ]),
        this.addRepeatList("coupledServices", "Darstellender Dienst", {
          hideExpression: "formState.hideOptionals",
        }),
        this.addGroupSimple("dataQualityInfo", [
          this.addGroupSimple("lineage", [
            this.addGroupSimple("source", [
              this.addRepeatList("descriptions", "Datengrundlage", {
                hideExpression: "formState.hideOptionals",
              }),
            ]),
            this.addGroupSimple("processStep", [
              this.addTextArea(
                "description",
                "Herstellungsprozess",
                "geoDataset",
                {
                  hideExpression: "formState.hideOptionals",
                }
              ),
            ]),
          ]),
        ]),
      ]),
      this.addSection("Datenqualität", [
        this.addGroupSimple("dataQuality", [
          this.addInput("coverage", "Datendefizit", {
            wrappers: ["panel", "form-field"],
            type: "number",
          }),
          this.addGroup(null, "Genauigkeit", [
            this.addInput("griddedDataPositionalAccuracy", null, {
              fieldLabel: "Rasterpositionsgenauigkeit (m)",
              type: "number",
              hideExpression:
                'formState.mainModel.spatialRepresentationType.find(x => x.key === "2") === undefined',
            }),
            this.addGroupSimple("absoluteExternalPositionalAccuracy", [
              this.addInput("vertical", null, {
                fieldLabel: "Höhengenauigkeit (m)",
                type: "number",
              }),
              this.addInput("horizontal", null, {
                fieldLabel: "Lagegenauigkeit (m)",
                type: "number",
              }),
            ]),
          ]),
          this.addTable("qualities", "Qualität", {
            supportUpload: false,
            hideExpression: "formState.hideOptionals",
            columns: [
              {
                key: "type",
                type: "select",
                label: "Typ",
                width: "300px",
                templateOptions: {
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
                templateOptions: {
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
                templateOptions: {
                  label: "Wert",
                  appearance: "outline",
                },
              },
              {
                key: "parameter",
                type: "input",
                label: "Parameter",
                width: "300px",
                templateOptions: {
                  label: "Parameter",
                  appearance: "outline",
                },
              },
            ],
          }),
        ]),
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

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    uploadService: UploadService
  ) {
    super(codelistService, codelistQuery, uploadService);
  }
}
