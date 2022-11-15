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
          hideExpression: "formState.hideOptionals",
        }),
        this.addInput("publisher", "Herausgeber", {
          wrappers: ["panel", "form-field"],
          hideExpression: "formState.hideOptionals",
        }),
        this.addGroup(
          null,
          "Erscheinung",
          [
            this.addGroup(
              null,
              null,
              [
                this.addInputInline("publishedIn", "Erschienen in"),
                this.addInputInline("publishLocation", "Erscheinungsort"),
              ],
              { wrappers: [] }
            ),
            this.addGroup(
              null,
              null,
              [
                this.addInputInline("publishedInIssue", "Band/Heft"),
                this.addInputInline("publishedInPages", "Seiten"),
                this.addInputInline("publishedInYear", "Erscheinungsjahr"),
              ],
              { wrappers: [] }
            ),
          ],
          {
            fieldGroupClassName: null,
            hideExpression: "formState.hideOptionals",
          }
        ),
        this.addTextArea("location", "Standort", this.id, {
          hideExpression: "formState.hideOptionals",
        }),
        this.addInput("publishedISBN", "ISBN-Nr.", {
          wrappers: ["panel", "form-field"],
          hideExpression: "formState.hideOptionals",
        }),
        this.addInput("publishedPublisher", "Verlag", {
          wrappers: ["panel", "form-field"],
          hideExpression: "formState.hideOptionals",
        }),
        this.addAutocomplete("documentType", "Dokumententyp", {
          options: this.getCodelistForSelect(3385, "documentType"),
          codelistId: 3385,
          hideExpression: "formState.hideOptionals",
        }),
        this.addTextArea("baseDataText", "Basisdaten", this.id, {
          hideExpression: "formState.hideOptionals",
        }),
        this.addGroup(
          null,
          "Weiteres",
          [
            this.addTextAreaInline(
              "bibliographicData",
              "Weitere bibliographische Angaben",
              this.id
            ),
            this.addTextAreaInline("explanation", "Erläuterungen", this.id),
          ],
          { hideExpression: "formState.hideOptionals" }
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
    uploadService: UploadService
  ) {
    super(codelistService, codelistQuery, uploadService);
  }
}
