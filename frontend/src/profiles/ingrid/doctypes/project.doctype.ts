import { CodelistService } from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { IngridShared } from "./ingrid-shared";
import { UploadService } from "../../../app/shared/upload/upload.service";

@Injectable({
  providedIn: "root",
})
export class ProjectDoctype extends IngridShared {
  id = "InGridProject";

  label = "Projekt";

  iconClass = "Projekt";

  hasOptionalFields = true;

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addGeneralSection(),
      this.addKeywordsSection(),

      this.addSection("Fachbezug", [
        this.addTextArea("participants", "Beteiligte", this.id, {
          className: "optional flex-1",
        }),
        this.addTextArea("manager", "Projektleiter", this.id, {
          className: "optional flex-1",
        }),
        this.addTextArea("explanation", "Erläuterungen", this.id, {
          className: "optional flex-1",
        }),
      ]),

      this.addSpatialSection(),
      this.addTimeReferenceSection(),
      this.addAdditionalInformationSection({ extraInfoLangData: true }),
      this.addAvailabilitySection(),
      this.addLinksSection(),
    ];

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    uploadService: UploadService
  ) {
    super(codelistService, codelistQuery, uploadService);
  }
}
