import { CodelistService } from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { IngridShared } from "./ingrid-shared";
import { UploadService } from "../../../app/shared/upload/upload.service";
import { MatDialog } from "@angular/material/dialog";
import { CookieService } from "../../../app/services/cookie.service";
import { MatSnackBar } from "@angular/material/snack-bar";

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
        this.addRepeat("categoryCatalog", "Objektartenkatalog", {
          className: "optional",
          expressions: {
            "props.required":
              "formState.mainModel?.databaseContent?.length > 0",
          },
          fields: [
            this.addAutocomplete("title", "Titel", {
              className: "flex-3",
              wrappers: ["form-field"],
              required: true,
              options: this.getCodelistForSelect(3535, "title"),
              codelistId: 3535,
            }),
            this.addDatepickerInline("date", "Datum", {
              className: "flex-1",
              required: true,
            }),
            this.addInputInline("edition", "Version", {
              className: "flex-1",
            }),
          ],
        }),
        this.addRepeat(
          "databaseContent",
          "Inhalte der Datensammlung/Datenbank",
          {
            className: "optional",
            fields: [
              this.addInputInline("parameter", "Parameter", {
                className: "flex-1",
              }),
              this.addInputInline("moreInfo", "Ergänzende Angaben", {
                className: "flex-1",
              }),
            ],
          }
        ),
        this.addTextArea("methodText", "Methode/Datengrundlage", this.id, {
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
    uploadService: UploadService,
    dialog: MatDialog,
    cookieService: CookieService,
    snack: MatSnackBar
  ) {
    super(
      codelistService,
      codelistQuery,
      uploadService,
      dialog,
      cookieService,
      snack
    );
  }
}
