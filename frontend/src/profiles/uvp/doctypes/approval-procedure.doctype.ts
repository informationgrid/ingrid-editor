import { CodelistService } from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { UvpShared } from "./uvp-shared";
import { UploadService } from "../../../app/shared/upload/upload.service";
import { ConfigService } from "../../../app/services/config/config.service";
import { map } from "rxjs/operators";
import { BehaviourService } from "../../../app/services/behavior/behaviour.service";

@Injectable({
  providedIn: "root",
})
export class ApprovalProcedureDoctype extends UvpShared {
  id = "UvpApprovalProcedureDoc";

  label = "Zulassungsverfahren";

  iconClass = "zulassungsverfahren";

  documentFields = () =>
    <FormlyFieldConfig[]>[
      {
        validators: {
          receiptDate: this.receiptDateValidator(),
        },
        fieldGroup: [
          this.addSection("Allgemeines", [
            this.addTextArea(
              "description",
              "Allgemeine Vorhabenbeschreibung",
              this.id,
              {
                required: true,
              }
            ),
            this.addPointOfContact(),
          ]),
          this.addSection("Raumbezug", [
            this.addSpatial("spatial", null, {
              required: true,
              limitTypes: ["free"],
              max: 1,
            }),
            this.addDatepicker("receiptDate", "Eingang des Antrags", {
              required: true,
              datepickerOptions: {
                max: new Date(),
              },
              validators: { ...this.dateTooBigValidator },
            }),
            this.addRepeatList("eiaNumbers", "UVP-Nummern", {
              required: true,
              showSearch: true,
              options: this.getCodelistForSelect(
                this.uvpNumberCodelistId,
                "eiaNumbers"
              ).pipe(map((list) => this.sortUVPNumber(list))),
              codelistId: this.uvpNumberCodelistId,
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
          ]),
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
            validators: {
              consistent: (control, field) => {
                const missingType = field.model?.some((item) => !item.type);
                if (missingType)
                  alert("Datensatz inkonsistent. Bitte neu laden.");
              },
            },
          },
        ],
      },
    ];

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    configService: ConfigService,
    uploadService: UploadService,
    behaviourService: BehaviourService
  ) {
    super(
      codelistService,
      codelistQuery,
      configService,
      uploadService,
      behaviourService
    );
  }
}
