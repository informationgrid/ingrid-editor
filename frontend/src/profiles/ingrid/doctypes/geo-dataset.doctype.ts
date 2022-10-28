import {
  CodelistService,
  SelectOptionUi,
} from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { BaseDoctype } from "../../base.doctype";
import { IngridShared } from "./ingrid-shared";

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
        this.addTextArea("baseText", "Fachliche Grundlage", this.id),
        this.addInput("sourceIdentifier", "Identifikator der Datenquelle", {
          required: true,
          wrappers: ["panel", "form-field"],
        }),
        this.addSelect(this.id, "Datensatz/Datenserie", {
          required: true,
          options: this.getCodelistForSelect(525, this.id),
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
    codelistQuery: CodelistQuery
  ) {
    super(codelistService, codelistQuery);
  }
}
