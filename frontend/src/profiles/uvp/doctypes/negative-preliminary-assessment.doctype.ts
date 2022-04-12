import { CodelistService } from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { ConfigService } from "../../../app/services/config/config.service";
import { UploadService } from "../../../app/shared/upload/upload.service";
import { UvpShared } from "./uvp-shared";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class NegativePreliminaryAssessmentDoctype extends UvpShared {
  id = "UvpNegativePreliminaryAssessmentDoc";

  label = "Negative Vorprüfung";

  iconClass = "negative-vorpruefung";

  forPublish = false;

  documentFields = () =>
    !this.forPublish
      ? <FormlyFieldConfig[]>[
          this.addSection("Allgemeines", [
            this.addPointOfContact(),
            this.addDatepicker("decisionDate", "Datum der Entscheidung", {
              required: true,
              datepickerOptions: {
                max: new Date(),
              },
            }),
          ]),
        ]
      : <FormlyFieldConfig[]>[
          this.addSection("Allgemeines", [
            this.addTextArea("description", "Allgemeine Vorhabenbeschreibung", {
              required: true,
            }),
            this.addPointOfContact(),
          ]),
          this.addSection("Raumbezug", [
            this.addSpatial("spatial", null, {
              required: true,
              limitTypes: ["free"],
            }),
            this.addRepeatList("eiaNumbers", "UVP-Nummern", {
              required: true,
              showSearch: true,
              options: this.getCodelistForSelect(9000, "eiaNumbers").pipe(
                map((list) => this.sortUVPNumber(list))
              ),
              codelistId: 9000,
              asSelect: true,
            }),
            this.addDatepicker("decisionDate", "Datum der Entscheidung", {
              required: true,
              datepickerOptions: {
                max: new Date(),
              },
            }),
            this.addTable(
              "uvpNegativeDecisionDocs",
              "Ergebnis der UVP-Vorprüfung",
              {
                required: true,
                columns: this.columnsForDocumentTable,
              }
            ),
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
