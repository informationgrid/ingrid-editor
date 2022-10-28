import { CodelistService } from "../../../app/services/codelist/codelist.service";
import { DocumentService } from "../../../app/services/document/document.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { CodelistQuery } from "../../../app/store/codelist/codelist.query";
import { IngridShared } from "./ingrid-shared";

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
        this.addTextArea("author", "Autor/Verfasser", this.id),
        this.addInput("publisher", "Herausgeber", {
          wrappers: ["panel", "form-field"],
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
          { fieldGroupClassName: null }
        ),
        this.addTextArea("location", "Standort", this.id),
        this.addInput("publishedISBN", "ISBN-Nr.", {
          wrappers: ["panel", "form-field"],
        }),
        this.addInput("publishedPublisher", "Verlag", {
          wrappers: ["panel", "form-field"],
        }),
        this.addAutocomplete("documentType", "Dokumententyp", {
          options: this.getCodelistForSelect(3385, "documentType"),
          codelistId: 3385,
        }),
        this.addTextArea("baseDataText", "Basisdaten", this.id),
        this.addGroup(null, "Weiteres", [
          this.addTextAreaInline(
            "bibliographicData",
            "Weitere bibliographische Angaben",
            this.id
          ),
          this.addTextAreaInline("explanation", "Erläuterungen", this.id),
        ]),
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
