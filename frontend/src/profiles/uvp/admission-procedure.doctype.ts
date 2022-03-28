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
        this.addPublisher(),
      ]),
      this.addSection("Raumbezug", [
        this.addSpatial("spatial", null, {
          required: true,
        }),
        this.addDatepicker("receiptDate", "Eingang des Antrags", {
          required: true,
        }),
        this.addRepeatList("eiaNumbers", "UVP-Nummern", {
          required: true,
          showSearch: true,
          options: this.getCodelistForSelect(9000, "eiaNumbers"),
          codelistId: 9000,
          asSelect: true,
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
