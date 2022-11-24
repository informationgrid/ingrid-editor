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
export class DataCollectionDoctype extends IngridShared {
  id = "InGridDataCollection";

  label = "Datensammlung";

  iconClass = "Datensammlung";

  hasOptionalFields = true;

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addGeneralSection({ openData: true }),
      this.addKeywordsSection(),

      this.addSection("Fachbezug", [
        this.addTable("categoryCatalog", "Objektartenkatalog", {
          supportUpload: false,
          columns: [],
          hideExpression: "formState.hideOptionals",
        }),
        this.addTable(
          "databaseContent",
          "Inhalte der Datensammlung/Datenbank",
          {
            supportUpload: false,
            columns: [],
            hideExpression: "formState.hideOptionals",
          }
        ),
        this.addTextArea("methodText", "Methode/Datengrundlage", this.id, {
          hideExpression: "formState.hideOptionals",
        }),
        this.addTextArea("explanation", "Erläuterungen", this.id, {
          hideExpression: "formState.hideOptionals",
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
