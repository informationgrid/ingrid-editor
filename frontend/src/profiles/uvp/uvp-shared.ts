import { FormGroup } from "@angular/forms";
import { ConfigService } from "../../app/services/config/config.service";
import { UploadService } from "../../app/shared/upload/upload.service";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { BaseDoctype } from "../base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";

export class UvpShared extends BaseDoctype {
  constructor(
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    private configService: ConfigService,
    private uploadService: UploadService
  ) {
    super(codelistService, codelistQuery);
  }

  protected columnsForDocumentTable = [
    {
      key: "title",
      type: "input",
      label: "Titel",
      width: "300px",
      templateOptions: {
        label: "Titel",
        appearance: "outline",
      },
    },
    {
      key: "downloadURL",
      type: "upload",
      label: "Link",
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
            }upload/${form.root.get("_uuid").value}/${
              link.uri
            }" class="no-text-transform">${link.uri}</a>`;
          }
        },
      },
    },
    {
      key: "expiryDate",
      type: "datepicker",
      label: "Gültig bis",
      width: "100px",
      templateOptions: {
        label: "Gültig bis",
        appearance: "outline",
        formatter: (item: any) => {
          return item ? new Date(item).toLocaleDateString() : "";
        },
      },
    },
  ];

  addPublicDisclosure() {
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

  addPublicHearing() {
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

  addDecisionOfAdmission() {
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

  documentFields(): FormlyFieldConfig[] {
    return [];
  }

  addPublisher() {
    return this.addAddressCard(
      "pointOfContact",
      "Kontaktdaten der verfahrensführenden Behörde",
      {
        required: true,
        allowedTypes: ["7"],
        max: 1,
        validators: {
          needPublisher: {
            expression: (ctrl) =>
              ctrl.value
                ? ctrl.value.some((row) => row.type.key === "7")
                : false,
            message: "Es muss ein Ansprechpartner als Adresse angegeben sein",
          },
          publisherPublished: {
            expression: (ctrl) =>
              ctrl.value
                ? ctrl.value.every((row) => row.ref._state === "P")
                : false,
            message: "Alle Adressen müssen veröffentlicht sein",
          },
        },
      }
    );
  }
}
