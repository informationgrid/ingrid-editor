import { CodelistService } from "../../app/services/codelist/codelist.service";
import { DocumentService } from "../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { UvpShared } from "./uvp-shared";
import { UploadService } from "../../app/shared/upload/upload.service";
import { ConfigService } from "../../app/services/config/config.service";

@Injectable({
  providedIn: "root",
})
export class AdmissionProcedureDoctype extends UvpShared {
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
            allowedTypes: ["7"],
            validators: {
              needPublisher: {
                expression: (ctrl) =>
                  ctrl.value
                    ? ctrl.value.some((row) => row.type.key === "10")
                    : false,
                message:
                  "Es muss ein Ansprechpartner als Adresse angegeben sein",
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
        ),
      ]),
      this.addSection("Raumbezug", [
        this.addSpatial("spatial", null, {
          required: true,
        }),
        this.addDatepicker("receiptDate", "Eingang des Antrags", {
          required: true,
        }),
        this.addSelect("eiaNumber", "UVP-Nummer", {
          required: true,
          showSearch: true,
          options: this.getCodelistForSelect(9000, "eiaNumber"),
          codelistId: 9000,
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

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    configService: ConfigService,
    uploadService: UploadService
  ) {
    super(codelistService, codelistQuery, configService, uploadService);
  }
}
