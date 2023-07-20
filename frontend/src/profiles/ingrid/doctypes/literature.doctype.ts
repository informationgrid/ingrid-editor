import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { IngridShared } from "./ingrid-shared";

@Injectable({
  providedIn: "root",
})
export class LiteratureDoctype extends IngridShared {
  id = "InGridLiterature";

  label = "Dokument";

  iconClass = "Literatur-Dokument";

  hasOptionalFields = true;

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addGeneralSection({ openData: true }),
      this.addKeywordsSection(),
      this.addSection("Fachbezug", [
        this.addGroupSimple("publication", [
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
                    wrappers: ["inline-help", "form-field"],
                  }),
                  this.addInputInline("placeOfPublication", "Erscheinungsort", {
                    hasInlineContextHelp: true,
                    wrappers: ["inline-help", "form-field"],
                  }),
                ],
                { wrappers: [] }
              ),
              this.addGroup(
                null,
                null,
                [
                  this.addInputInline("volume", "Band/Heft", {
                    hasInlineContextHelp: true,
                    wrappers: ["inline-help", "form-field"],
                  }),
                  this.addInputInline("pages", "Seiten", {
                    hasInlineContextHelp: true,
                    wrappers: ["inline-help", "form-field"],
                  }),
                  this.addInputInline("publicationDate", "Erscheinungsjahr", {
                    hasInlineContextHelp: true,
                    wrappers: ["inline-help", "form-field"],
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
          this.addInput("isbn", "ISBN-Nr.", {
            wrappers: ["panel", "form-field"],
            className: "optional",
          }),
          this.addInput("publishingHouse", "Verlag", {
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
                  wrappers: ["inline-help", "form-field"],
                }
              ),
              this.addTextAreaInline("explanation", "Erläuterungen", this.id, {
                hasInlineContextHelp: true,
                wrappers: ["inline-help", "form-field"],
              }),
            ],
            { className: "optional" }
          ),
        ]),
      ]),

      this.addSpatialSection(),
      this.addTimeReferenceSection(),
      this.addAdditionalInformationSection({ extraInfoLangData: true }),
      this.addAvailabilitySection(),
      this.addLinksSection(),
    ];
}
