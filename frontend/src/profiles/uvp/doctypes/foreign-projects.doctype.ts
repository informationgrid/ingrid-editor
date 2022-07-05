import { CodelistService } from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { ConfigService } from "../../../app/services/config/config.service";
import { UploadService } from "../../../app/shared/upload/upload.service";
import { UvpShared } from "./uvp-shared";

@Injectable({
  providedIn: "root",
})
export class ForeignProjectsDoctype extends UvpShared {
  id = "UvpForeignProjectDoc";

  label = "Ausländisches Vorhaben";

  iconClass = "auslaendisches-vorhaben";

  documentFields = () =>
    <FormlyFieldConfig[]>[
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
      ]),
      {
        key: "processingSteps",
        type: "uvpPhases",
        fieldArray: {
          fieldGroup: [
            this.addPublicDisclosure(),
            this.addDecisionOfAdmission(),
          ],
        },
      },
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
