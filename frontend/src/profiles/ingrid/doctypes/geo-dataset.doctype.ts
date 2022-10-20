import {
  CodelistService,
  SelectOptionUi,
} from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { BaseDoctype } from "../../base.doctype";

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
export class GeoDatasetDoctype extends BaseDoctype {
  id = "InGridGeoDataset";

  label = "Geodatensatz";

  iconClass = "Geodatensatz";

  hasOptionalFields = true;

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addSection("Allgemeines", [
        this.addGroup(
          null,
          "Info",
          [
            this.addInput("parentUuid", null, {
              fieldLabel: "Identifikator des übergeordneten Metadatensatzes",
            }),
            this.addInput("metadataDate", null, {
              fieldLabel: "Metadaten-Datum (veröffentlichte Version)",
            }),
          ],
          { hideExpression: "formState.hideOptionals" }
        ),
        this.addRepeatList("previewGraphic", "Vorschaugrafik", {
          hideExpression: "formState.hideOptionals",
        }),
        this.addInput("shortDescription", "Kurzbezeichnung", {
          wrappers: ["panel", "form-field"],
          hideExpression: "formState.hideOptionals",
        }),
        this.addTextArea("description", "Beschreibung", this.id, {
          required: true,
        }),
        this.addAddressCard("addresses", "Adressen"),
        this.addGroup(null, "Typ", [
          this.addCheckbox("isInspireRelevant", "INSPIRE-relevant", {
            wrappers: ["form-field", "inline-help"],
            fieldLabel: "INSPIRE-relevant",
            className: "flex-1",
          }),
          this.addCheckbox("isAdVCompatible", "AdV kompatibel", {
            wrappers: ["form-field", "inline-help"],
            fieldLabel: "AdV kompatibel",
            className: "flex-1",
          }),
          this.addCheckbox("isOpenData", "Open Data", {
            wrappers: ["form-field", "inline-help"],
            fieldLabel: "Open Data",
            className: "flex-1",
          }),
        ]),
      ]),
      this.addSection("Verschlagwortung", [
        this.addRepeatList("advProductGroup", "AdV-Produktgruppe", {
          asSelect: true,
          options: this.getCodelistForSelect(8010, "advProductGroup"),
          codelistId: 8010,
          hideExpression: "formState.hideOptionals",
        }),
        this.addRepeatList("inspireTopics", "INSPIRE-Themen", {
          asSelect: true,
          options: this.getCodelistForSelect(6100, "inspireTopics"),
          codelistId: 6100,
          hideExpression: "formState.hideOptionals",
        }),
        // TODO: output needs to be formatted in a different way
        this.addRepeatList("priorityDataset", "INSPIRE - priority data set", {
          asSelect: true,
          options: this.getCodelistForSelect(6350, "priorityDataset"),
          codelistId: 6350,
          hideExpression: "formState.hideOptionals",
        }),
        this.addSelect(
          "spatialScope",
          "INSPIRE - Räumlicher Anwendungsbereich",
          {
            options: this.getCodelistForSelect(6360, "spatialScope"),
            codelistId: 6360,
          }
        ),
        this.addRepeatList("thesaurusTopics", "ISO-Themenkategorie", {
          asSelect: true,
          options: this.getCodelistForSelect(527, "thesaurusTopics"),
          codelistId: 527,
        }),
        this.addRepeatChip("keywords", "Optionale Schlagworte"),
      ]),
      this.addSection("Fachbezug", [
        this.addTextArea("baseText", "Fachliche Grundlage", "dataset"),
        this.addInput("sourceIdentifier", "Identifikator der Datenquelle", {
          required: true,
          wrappers: ["panel", "form-field"],
        }),
        this.addSelect("dataset", "Datensatz/Datenserie", {
          required: true,
          options: this.getCodelistForSelect(525, "dataset"),
          codelistId: 525,
        }),
        this.addRepeatList("digitalRepresentation", "Digitale Repräsentation", {
          asSelect: true,
          options: this.getCodelistForSelect(526, "priorityDataset"),
          codelistId: 526,
          hideExpression: "formState.hideOptionals",
        }),
        this.addTable("scale", "Erstellungsmaßstab", {
          supportUpload: false,
          hideExpression: "formState.hideOptionals",
          columns: [
            {
              key: "scale",
              type: "input",
              label: "Maßstab 1:x",
              templateOptions: {
                type: "number",
                label: "Maßstab 1:x",
                appearance: "outline",
              },
            },
            {
              key: "groundResolution",
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
              key: "scanResolution",
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
        this.addTable("symbol", "Symbolkatalog", {
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
        this.addTable("keys", "Schlüsselkatalog", {
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
        this.addRepeatList("attributes", "Sachdaten/Attributinformation", {
          hideExpression: "formState.hideOptionals",
        }),
        this.addRepeatList("coupledServices", "Darstellender Dienst", {
          hideExpression: "formState.hideOptionals",
        }),
        this.addRepeatList("dataBasis", "Datengrundlage", {
          hideExpression: "formState.hideOptionals",
        }),
        this.addTextArea("process", "Herstellungsprozess", "geoDataset", {
          hideExpression: "formState.hideOptionals",
        }),
      ]),
      this.addSection("Datenqualität", [
        this.addInput("coverage", "Datendefizit", {
          wrappers: ["panel", "form-field"],
        }),
        this.addGroup(null, "Genauigkeit", [
          this.addInput("altAccuracy", null, {
            fieldLabel: "Höhengenauigkeit (m)",
          }),
          this.addInput("posAccuracy", null, {
            fieldLabel: "Lagegenauigkeit (m)",
          }),
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
      this.addSection("Raumbezugssystem", [
        this.addSpatial("spatial", "Raumbezug"),
        this.addRepeatList("spatialSystems", "Raumbezugssysteme", {
          asSelect: true,
          options: this.getCodelistForSelect(100, "spatialSystems"),
          codelistId: 100,
          required: true,
        }),
        this.addGroup(
          null,
          "Höhe",
          [
            {
              fieldGroup: [
                {
                  fieldGroupClassName: "display-flex",
                  fieldGroup: [
                    this.addInput("spatialRefAltMin", null, {
                      fieldLabel: "Minimum",
                    }),
                    this.addInput("spatialRefAltMax", null, {
                      fieldLabel: "Maximum",
                    }),
                    this.addSelect("spatialRefAltMeasure", null, {
                      fieldLabel: "Maßeinheit",
                      options: this.getCodelistForSelect(
                        102,
                        "spatialRefAltMeasure"
                      ),
                      codelistId: 102,
                      wrappers: ["form-field"],
                      className: "flex-1",
                    }),
                  ],
                },
              ],
            },
            {
              fieldGroupClassName: "display-flex",
              fieldGroup: [
                this.addSelect("spatialRefAltVDate", null, {
                  fieldLabel: "Vertikaldatum",
                  options: this.getCodelistForSelect(101, "spatialRefAltVDate"),
                  codelistId: 101,
                  wrappers: ["form-field"],
                  className: "width-100",
                }),
              ],
            },
          ],
          {
            fieldGroupClassName: null,
            hideExpression: "formState.hideOptionals",
          }
        ),
        this.addTextArea("spatialRefExplanation", "Erläuterungen", "spatial", {
          hideExpression: "formState.hideOptionals",
        }),
      ]),
      this.addSection("Zeitbezug", [
        this.addRepeat("timeRefTable", "Zeitbezug der Resource", {
          required: true,
          // wrappers: [],
          fields: [
            this.addDatepicker("date", null, {
              fieldLabel: "Datum",
              className: "flex-1",
              required: true,
              wrappers: ["form-field"],
            }),
            this.addSelect("type", null, {
              fieldLabel: "Typ",
              wrappers: null,
              className: "flex-3",
              required: true,
              options: this.getCodelistForSelect(502, "type"),
              codelistId: 502,
            }),
          ],
        }),
        this.addTextArea("timeRefExplanation", "Erläuterungen", "dataset", {
          hideExpression: "formState.hideOptionals",
        }),
        this.addGroup(
          null,
          "Durch die Ressource abgedeckte Zeitspanne",
          [
            this.addSelect("timeRefType", null, {
              wrappers: ["form-field"],
              fieldLabel: "Typ",
              options: <SelectOptionUi[]>[
                { label: "am", value: "am" },
                { label: "bis", value: "bis" },
                { label: "von", value: "fromType" },
              ],
            }),
            this.addDatepicker("timeRefDate1", null, {
              wrappers: ["form-field"],
            }),
          ],
          { hideExpression: "formState.hideOptionals" }
        ),
        this.addSelect("timeRefStatus", "Status", {
          options: this.getCodelistForSelect(523, "timeRefStatus"),
          codelistId: 523,
          hideExpression: "formState.hideOptionals",
        }),
        this.addSelect("timeRefPeriodicity", "Periodizität", {
          options: this.getCodelistForSelect(518, "timeRefPeriodicity"),
          codelistId: 518,
          hideExpression: "formState.hideOptionals",
        }),
        this.addGroup(
          null,
          "Im Intervall",
          [
            this.addInput("timeRefIntervalNum", null, {
              fieldLabel: "Anzahl",
              type: "number",
              className: "flex-1",
            }),
            this.addSelect("timeRefStatus", "Einheit", {
              wrappers: ["form-field"],
              options: this.getCodelistForSelect(1230, "timeRefStatus"),
              codelistId: 1230,
              className: "flex-3",
            }),
          ],
          { hideExpression: "formState.hideOptionals" }
        ),
      ]),
      // ]),
      this.addSection("Zusatzinformation", [
        this.addSelect("extraInfoPublishArea", "Veröffentlichung", {
          options: this.getCodelistForSelect(3571, "extraInfoPublishArea"),
          codelistId: 3571,
          required: true,
        }),
        this.addSelect("extraInfoLangMetaData", "Sprache des Metadatensatzes", {
          options: this.getCodelistForSelect(99999999, "extraInfoLangMetaData"),
          codelistId: 99999999,
          required: true,
        }),
        this.addSelect("extraInfoCharSetData", "Zeichensatz des Datensatzes", {
          options: this.getCodelistForSelect(510, "extraInfoCharSetData"),
          codelistId: 510,
          hideExpression: "formState.hideOptionals",
        }),
        this.addRepeatList("extraInfoLangData", "Sprache der Ressource", {
          options: this.getCodelistForSelect(99999999, "extraInfoLangData"),
          codelistId: 99999999,
          required: true,
        }),
        this.addTable("conformity", "Konformität", {
          supportUpload: false,
          hideExpression: "formState.hideOptionals",
          columns: [
            {
              key: "specification",
              type: "select",
              label: "Spezifikation",
              templateOptions: {
                label: "Spezifikation",
                appearance: "outline",
                options: this.getCodelistForSelect(6005, "specification"),
                codelistId: 6005, // TODO: can also be 6006 depending if it's INSPIRE!
                formatter: (item: any) =>
                  this.formatCodelistValue("6005", item),
              },
            },
            {
              key: "level",
              type: "select",
              label: "Grad",
              width: "100px",
              templateOptions: {
                label: "Grad",
                appearance: "outline",
                options: this.getCodelistForSelect(6000, "level"),
                codelistId: 6000,
                formatter: (item: any) =>
                  this.formatCodelistValue("6000", item),
              },
            },
            {
              key: "date",
              type: "datepicker",
              label: "Datum",
              width: "100px",
              templateOptions: {
                label: "Datum",
                appearance: "outline",
                formatter: (date: Date) => {
                  return new Date(date).toLocaleDateString();
                },
              },
            },
            {
              key: "explanation",
              type: "input",
              label: "geprüft mit",
              width: "200px",
              templateOptions: {
                label: "geprüft mit",
                appearance: "outline",
              },
            },
          ],
        }),
        this.addRepeatList("extraInfoXMLExportTable", "XML-Export-Kriterium", {
          asSelect: true,
          options: this.getCodelistForSelect(1370, "extraInfoXMLExportTable"),
          codelistId: 1370,
          hideExpression: "formState.hideOptionals",
        }),
        this.addRepeatList(
          "extraInfoLegalBasicsTable",
          "Weitere Rechtliche Grundlagen",
          {
            asSelect: true,
            options: this.getCodelistForSelect(
              1350,
              "extraInfoLegalBasicsTable"
            ),
            codelistId: 1350,
            hideExpression: "formState.hideOptionals",
          }
        ),
        this.addTextArea("extraInfoPurpose", "Herstellungszweck", "dataset", {
          hideExpression: "formState.hideOptionals",
        }),
        this.addTextArea("extraInfoUse", "Eignung/Nutzung", "dataset", {
          hideExpression: "formState.hideOptionals",
        }),
      ]),
      this.addSection("Verfügbarkeit", [
        this.addRepeatList(
          "availabilityAccessConstraints",
          "Zugriffsbeschränkungen",
          {
            asSelect: true, // TODO: also allow free values
            options: this.getCodelistForSelect(
              6010,
              "availabilityAccessConstraints"
            ),
            codelistId: 6010,
          }
        ),
        this.addRepeat(
          "availabilityUseAccessConstraints",
          "Nutzungsbedingungen",
          {
            required: true,
            fields: [
              this.addSelect("license", null, {
                options: this.getCodelistForSelect(6500, "license"),
                fieldLabel: "Lizenz",
                codelistId: 6500,
                wrappers: ["form-field"],
                className: "flex-1",
              }),
              this.addInput("source", null, {
                wrappers: ["form-field"],
                fieldLabel: "Quelle",
                className: "flex-1",
              }),
            ],
          }
        ),
        this.addTextArea(
          "availabilityUseConstraints",
          "Anwendungseinschränkungen",
          "dataset",
          { hideExpression: "formState.hideOptionals" }
        ),
        this.addTable("availabilityDataFormat", "Datenformat", {
          supportUpload: false,
          hideExpression: "formState.hideOptionals",
          columns: [
            {
              key: "name",
              type: "select",
              label: "Name",
              templateOptions: {
                label: "Name",
                appearance: "outline",
                options: this.getCodelistForSelect(1320, "specification"),
                codelistId: 1320,
                formatter: (item: any) =>
                  this.formatCodelistValue("1320", item),
              },
            },
            {
              key: "version",
              type: "input",
              label: "Version",
              width: "100px",
              templateOptions: {
                label: "Version",
                appearance: "outline",
              },
            },
            {
              key: "compression",
              type: "input",
              label: "Kompressionstechnik",
              width: "100px",
              templateOptions: {
                label: "Kompressionstechnik",
                appearance: "outline",
              },
            },
            {
              key: "specification",
              type: "input",
              label: "Spezifikation",
              width: "200px",
              templateOptions: {
                label: "Spezifikation",
                appearance: "outline",
              },
            },
          ],
        }),
        this.addTable("availabilityMediaOptions", "Medienoption", {
          supportUpload: false,
          hideExpression: "formState.hideOptionals",
          columns: [
            {
              key: "medium",
              type: "select",
              label: "Medium",
              templateOptions: {
                label: "Medium",
                appearance: "outline",
                options: this.getCodelistForSelect(520, "specification"),
                codelistId: 520,
                formatter: (item: any) => this.formatCodelistValue("520", item),
              },
            },
            {
              key: "volume",
              type: "input",
              label: "Datenvolumen (MB)",
              width: "100px",
              templateOptions: {
                label: "Datenvolumen (MB)",
                appearance: "outline",
              },
            },
            {
              key: "location",
              type: "input",
              label: "Speicherort",
              width: "100px",
              templateOptions: {
                label: "Speicherort",
                appearance: "outline",
              },
            },
          ],
        }),
        this.addTextArea(
          "availabilityOrderInfo",
          "Bestellinformation",
          "dataset",
          { hideExpression: "formState.hideOptionals" }
        ),
      ]),
      this.addSection("Verweise", [
        this.addTable("linksTo", "Verweise", {
          supportUpload: false,
          hideExpression: "formState.hideOptionals",
          columns: [],
        }),
      ]),
    ];

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery
  ) {
    super(codelistService, codelistQuery);
  }
}
