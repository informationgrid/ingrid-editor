import { CodelistService } from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { BaseDoctype } from "../../base.doctype";
import { map } from "rxjs/operators";

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
          "???",
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
        this.addCheckbox("isInspireRelevant", "INSPIRE-relevant"),
        this.addCheckbox("isAdVCompatible", "AdV kompatibel"),
        this.addCheckbox("isOpenData", "Open Data"),
      ]),
      this.addSection("Verschlagwortung", [
        this.addRepeatList("advProductGroup", "AdV-Produktgruppe", {
          asSelect: true,
          options: this.getCodelistForSelect(8010, "advProductGroup"),
          codelistId: 8010,
        }),
        this.addRepeatList("inspireTopics", "INSPIRE-Themen", {
          asSelect: true,
          options: this.getCodelistForSelect(6100, "inspireTopics"),
          codelistId: 6100,
        }),
        // TODO: output needs to be formatted in a different way
        this.addRepeatList("priorityDataset", "INSPIRE - priority data set", {
          asSelect: true,
          options: this.getCodelistForSelect(6350, "priorityDataset"),
          codelistId: 6350,
        }),
        this.addSelect(
          "spatialScope",
          "INSPIRE - Räumlicher Anwendungsbereich",
          {
            options: this.getCodelistForSelect(6360, "spatialScope"),
            codelistId: 6360,
          }
        ),
        this.addRepeatList("thesaurusTopics", "INSPIRE - priority data set", {
          asSelect: true,
          options: this.getCodelistForSelect(527, "thesaurusTopics"),
          codelistId: 527,
        }),
        this.addRepeatChip("keywords", "Optionale Schlagworte"),
      ]),
      this.addSection("Fachbezug", [
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
        }),
        this.addTable("scale", "Erstellungsmaßstab", {
          supportUpload: false,
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
        this.addRepeatList("attributes", "Sachdaten/Attributinformation"),
        this.addRepeatList("coupledServices", "Darstellender Dienst"),
        this.addRepeatList("dataBasis", "Datengrundlage"),
        this.addTextArea("process", "Herstellungsprozess", "geoDataset"),
      ]),
      this.addSection("Datenqualität", []),
      this.addSection("Raumbezugssystem", []),
      this.addSection("Zeitbezug", []),
      this.addSection("Zusatzinformation", []),
      this.addSection("Verfügbarkeit", []),
      this.addSection("Verweise", []),
    ];

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery
  ) {
    super(codelistService, codelistQuery);
  }
}
