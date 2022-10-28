import { CodelistService } from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { IngridShared } from "./ingrid-shared";

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
        }),
        this.addTable(
          "databaseContent",
          "Inhalte der Datensammlung/Datenbank",
          {
            supportUpload: false,
            columns: [],
          }
        ),
        this.addTextArea("methodText", "Methode/Datengrundlage", this.id),
        this.addTextArea("explanation", "Erläuterungen", this.id),
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
    codelistQuery: CodelistQuery
  ) {
    super(codelistService, codelistQuery);
  }
}
