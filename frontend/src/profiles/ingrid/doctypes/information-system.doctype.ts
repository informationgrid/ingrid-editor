import {
  CodelistService,
  SelectOptionUi,
} from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { IngridShared } from "./ingrid-shared";
import { UploadService } from "../../../app/shared/upload/upload.service";

@Injectable({
  providedIn: "root",
})
export class InformationSystemDoctype extends IngridShared {
  id = "InGridInformationSystem";

  label = "Informationssystem";

  iconClass = "Informationssystem";

  hasOptionalFields = true;

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addGeneralSection({ inspireRelevant: true, openData: true }),
      this.addKeywordsSection(),

      this.addSection("Fachbezug", [
        this.addGroup(null, "Beschreibung", [
          this.addSelectInline("serviceType", "Art des Dienstes", {
            options: this.getCodelistForSelect(5300, "serviceType"),
            codelistId: 5300,
          }),
          this.addRepeatListInline("serviceVersion", "Version", {
            hideExpression: "formState.hideOptionals",
          }),
        ]),
        this.addGroup(
          null,
          "Weitere Informationen",
          [
            this.addTextAreaInline(
              "systemEnvironment",
              "Systemumgebung",
              this.id
            ),
            this.addTextAreaInline("history", "Historie", this.id),
          ],
          { hideExpression: "formState.hideOptionals" }
        ),
        this.addGroup(
          null,
          null,
          [
            this.addTextAreaInline("baseDataText", "Basisdaten", this.id),
            this.addTextAreaInline("explanation", "Erläuterungen", this.id),
          ],
          { hideExpression: "formState.hideOptionals" }
        ),
        this.addTable("serviceUrls", "Service-Urls", {
          supportUpload: false,
          columns: [],
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
