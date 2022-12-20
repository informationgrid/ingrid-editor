import { CodelistService } from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { IngridShared } from "./ingrid-shared";
import { UploadService } from "../../../app/shared/upload/upload.service";
import { MatDialog } from "@angular/material/dialog";
import { CookieService } from "../../../app/services/cookie.service";

@Injectable({
  providedIn: "root",
})
export class LiteratureDoctype extends IngridShared {
  id = "InGridLiterature";

  label = "Literatur";

  iconClass = "Literatur-Dokument";

  hasOptionalFields = true;

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addGeneralSection({ openData: true }),
      this.addKeywordsSection(),

      this.addSection("Fachbezug", [
        this.addTextArea("author", "Autor/Verfasser", this.id, {
          className: "optional flex-1",
        }),
        this.addInput("publisher", "Herausgeber", {
          wrappers: ["panel", "form-field"],
          className: "optional",
        }),
        this.addGroup(
          null,
          "Erscheinung",
          [
            this.addGroup(
              null,
              null,
              [
                this.addInputInline("publishedIn", "Erschienen in", {
                  hasInlineContextHelp: true,
                  wrappers: ["form-field", "inline-help"],
                }),
                this.addInputInline("publishLocation", "Erscheinungsort", {
                  hasInlineContextHelp: true,
                  wrappers: ["form-field", "inline-help"],
                }),
              ],
              { wrappers: [] }
            ),
            this.addGroup(
              null,
              null,
              [
                this.addInputInline("publishedInIssue", "Band/Heft", {
                  hasInlineContextHelp: true,
                  wrappers: ["form-field", "inline-help"],
                }),
                this.addInputInline("publishedInPages", "Seiten", {
                  hasInlineContextHelp: true,
                  wrappers: ["form-field", "inline-help"],
                }),
                this.addInputInline("publishedInYear", "Erscheinungsjahr", {
                  hasInlineContextHelp: true,
                  wrappers: ["form-field", "inline-help"],
                }),
              ],
              { wrappers: [] }
            ),
          ],
          {
            fieldGroupClassName: "",
            className: "optional",
          }
        ),
        this.addTextArea("location", "Standort", this.id, {
          className: "optional flex-1",
        }),
        this.addInput("publishedISBN", "ISBN-Nr.", {
          wrappers: ["panel", "form-field"],
          className: "optional",
        }),
        this.addInput("publishedPublisher", "Verlag", {
          wrappers: ["panel", "form-field"],
          className: "optional",
        }),
        this.addAutocomplete("documentType", "Dokumententyp", {
          options: this.getCodelistForSelect(3385, "documentType"),
          codelistId: 3385,
          className: "optional",
        }),
        this.addTextArea("baseDataText", "Basisdaten", this.id, {
          className: "optional flex-1",
        }),
        this.addGroup(
          null,
          "Weiteres",
          [
            this.addTextAreaInline(
              "bibliographicData",
              "Weitere bibliographische Angaben",
              this.id,
              {
                hasInlineContextHelp: true,
                wrappers: ["form-field", "inline-help"],
              }
            ),
            this.addTextAreaInline("explanation", "Erläuterungen", this.id, {
              hasInlineContextHelp: true,
              wrappers: ["form-field", "inline-help"],
            }),
          ],
          { className: "optional" }
        ),
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
    cookieService: CookieService
  ) {
    super(codelistService, codelistQuery, uploadService, dialog, cookieService);
  }
}
