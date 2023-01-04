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
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { CookieService } from "../../../app/services/cookie.service";

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
        this.addGroupSimple("lineage", [
          this.addTextArea("statement", "Fachliche Grundlage", this.id, {
            required: true,
          }),
        ]),

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
            className: "optional",
            expressions: {
              "props.required": "formState.mainModel.isInspireConform",
            },
          }
        ),
        this.addRepeat("vectorSpatialRepresentation", "Topologieinformation", {
          fields: [
            this.addSelectInline("topologyLevel", "Topologieinformation", {
              options: this.getCodelistForSelect(528, "topologyLevel"),
              codelistId: 528,
            }),
            this.addSelectInline("geometricObjectType", "Geometrietyp", {
              options: this.getCodelistForSelect(515, "geometricObjectType"),
              codelistId: 515,
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
          className: "optional",
          fields: [
            this.addInputInline("denominator", "Maßstab 1:x", {
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
            fields: this.titleDateEditionFields(3555),
          }),
        ]),
        this.addGroupSimple("featureCatalogueDescription", [
          this.addRepeat("citation", "Schlüsselkatalog", {
            fields: this.titleDateEditionFields(3535),
            expressions: {
              "props.required":
                "formState.mainModel.featureCatalogueDescription?.featureTypes?.length > 0",
            },
          }),
          this.addRepeatList("featureTypes", "Sachdaten/Attributinformation", {
            className: "optional",
          }),
        ]),
        this.addReferencesForAddress(
          "coupledResources",
          "uuid",
          "Darstellender Dienst",
          true,
          false,
          "Dieser Datensatz wurde von keinem Geodatendienst referenziert",
          "Die Referenz kann nur vom darstellenden Dienst entfernt werden"
        ),
        this.addGroupSimple("dataQualityInfo", [
          this.addGroupSimple("lineage", [
            this.addGroupSimple("source", [
              this.addRepeatList("descriptions", "Datengrundlage", {
                className: "optional flex-1",
              }),
              this.addGroupSimple("processStep", [
                this.addTextArea(
                  "description",
                  "Herstellungsprozess",
                  this.id,
                  {
                    className: "optional",
                  }
                ),
              ]),
            ]),
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
        ]),
        this.addGroup(
          "absoluteExternalPositionalAccuracy",
          "Genauigkeit",
          [
            this.addInput("griddedDataPositionalAccuracy", null, {
              fieldLabel: "Rasterpositionsgenauigkeit (m)",
              type: "number",
              className: "optional",
              expressions: {
                hide: '!formState.mainModel.spatialRepresentationType?.find(x => x.key === "2")',
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
        this.addRepeat("qualities", "Qualität", {
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
    uploadService: UploadService,
    dialog: MatDialog,
    cookieService: CookieService
  ) {
    super(codelistService, codelistQuery, uploadService, dialog, cookieService);
  }

  private getQualityFields(codelistId: number) {
    return this.addGroupSimple(
      null,
      [
        { key: "_type" },
        this.addSelectInline("measureType", "Art der Messung", {
          required: true,
          options: this.getCodelistForSelect(codelistId, "measureType"),
          codelistId: codelistId,
          className: "flex-2",
        }),
        this.addInputInline("value", "Wert", {
          required: true,
          type: "number",
        }),
        this.addInputInline("parameter", "Parameter"),
      ],
      { fieldGroupClassName: "display-flex" }
    );
  }
}
