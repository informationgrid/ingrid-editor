import { CodelistService } from "../../app/services/codelist/codelist.service";
import { DocumentService } from "../../app/services/document/document.service";
import { BaseDoctype } from "../base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { FormGroup } from "@angular/forms";
import { ConfigService } from "../../app/services/config/config.service";
import { UploadService } from "../../app/shared/upload/upload.service";

@Injectable({
  providedIn: "root",
})
export class AdmissionProcedureDoctype extends BaseDoctype {
  id = "UvpAdmissionProcedureDoc";

  label = "Zulassungsverfahren";

  iconClass = "Projekt";

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addSection("Allgemeines", [
        this.addTextArea("description", "Allgemeine Vorhabenbeschreibung", {
          required: true,
        }),
        this.addAddressCard(
          "publisher",
          "Kontaktdaten der verfahrensführenden Behörde",
          {
            required: true,
          }
        ),
      ]),
      this.addSection("Raumbezug", [
        this.addSpatial("spatial", null, {
          required: true,
        }),
        this.addDatepicker("receiptDate", "Eingang des Antrags", {
          required: true,
        }),
        this.addRepeatChip("eiaNumber", "UVP-Nummer", {
          required: true,
        }),
        this.addRadioboxes("prelimAssessment", "Vorprüfung durchgeführt", {
          required: true,
          options: [
            {
              value: "Ja",
              id: true,
            },
            {
              value: "Nein",
              id: false,
            },
          ],
        }),
        {
          key: "processingSteps",
          type: "uvpPhases",
          fieldArray: {
            fieldGroup: [
              this.addPublicDisclosure(),
              this.addPublicHearing(),
              this.addDecisionOfAdmission(),
            ],
          },
        },
      ]),
    ];
  private columnsForDocumentTable = [
    {
      key: "title",
      type: "input",
      label: "Titel",
      focus: true,
      class: "flex-2",
      templateOptions: {
        label: "Titel",
        appearance: "outline",
      },
    },
    {
      key: "link",
      type: "upload",
      label: "Link",
      class: "flex-2",
      templateOptions: {
        label: "Link",
        appearance: "outline",
        required: true,

        onClick: (docUuid, uri, $event) => {
          this.uploadService.downloadFile(docUuid, uri, $event);
        },
        formatter: (link: any, form: FormGroup) => {
          if (link.asLink) {
            return `<a href="${link.value}" target="_blank" class="no-text-transform">${link.value}</a>`;
          } else {
            return `<a href="${
              this.configService.getConfiguration().backendUrl
            }upload/${form.get("_uuid").value}/${
              link.uri
            }" class="no-text-transform">${link.uri}</a>`;
          }
        },
      },
    },
  ];

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    private configService: ConfigService,
    private uploadService: UploadService
  ) {
    super(codelistService, codelistQuery);
  }

  private addPublicDisclosure() {
    return {
      name: "publicDisclosure",
      hideExpression: 'model.type !== "publicDisclosure"',
      templateOptions: {
        label: "Öffentliche Auslegung",
      },
      fieldGroup: [
        this.addSection("Öffentliche Auslegung", [
          { key: "type" },
          this.addDateRange("disclosureDate", "Zeitraum der Auslegung", {
            required: true,
            wrappers: ["panel", "form-field"],
          }),
          this.addTable("announcementDocs", "Auslegungsinformationen", {
            required: true,
            columns: this.columnsForDocumentTable,
          }),
          this.addTable("applicationDocs", "UVP Bericht/Antragsunterlagen", {
            required: true,
            columns: this.columnsForDocumentTable,
          }),
          this.addTable(
            "reportsRecommendationDocs",
            "Berichte und Empfehlungen",
            {
              required: false,
              columns: this.columnsForDocumentTable,
            }
          ),
          this.addTable("furtherDocs", "Weitere Unterlagen", {
            required: false,
            columns: this.columnsForDocumentTable,
          }),
        ]),
      ],
    };
  }

  private addPublicHearing() {
    return {
      name: "publicHearing",
      hideExpression: 'model.type !== "publicHearing"',
      templateOptions: {
        label: "Erörterungstermin",
      },
      fieldGroup: [
        this.addSection("Erörterungstermin", [
          { key: "type" },
          this.addDateRange("publicHearingDate", "Zeitraum der Erörterung", {
            required: true,
            wrappers: ["panel", "form-field"],
          }),
          this.addTable(
            "considerationDocs",
            "Informationen zum Erörterungstermin",
            {
              required: true,
              columns: this.columnsForDocumentTable,
            }
          ),
        ]),
      ],
    };
  }

  private addDecisionOfAdmission() {
    return {
      name: "decisionOfAdmission",
      hideExpression: 'model.type !== "decisionOfAdmission"',
      templateOptions: {
        label: "Entscheidung über die Zulassung",
      },
      fieldGroup: [
        this.addSection("Entscheidung über die Zulassung", [
          { key: "type" },
          this.addDatepicker("decisionDate", "Datum der Entscheidung", {
            required: true,
          }),
          this.addTable("approvalDocs", "Auslegungsinformationen", {
            required: false,
            columns: this.columnsForDocumentTable,
          }),
          this.addTable("decisionDocs", "Entscheidung", {
            required: false,
            columns: this.columnsForDocumentTable,
          }),
        ]),
      ],
    };
  }
}
