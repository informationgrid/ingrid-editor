/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { IngridShared } from "./ingrid-shared";

@Injectable({
  providedIn: "root",
})
export class PublicationDoctype extends IngridShared {
  id = "InGridPublication";

  label = "Dokument";

  iconClass = "Publikation-Dokument";

  hasOptionalFields = true;

  constructor() {
    super();
    this.options.required.extraInfoLangData = true;
  }

  documentFields = () => {
    const fields = <FormlyFieldConfig[]>[
      this.addGeneralSection(),
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
                { wrappers: [] },
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
                { wrappers: [] },
              ),
            ],
            {
              fieldGroupClassName: "",
              className: "optional",
            },
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
            options: this.getCodelistForSelect("3385", "documentType"),
            codelistId: "3385",
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
                },
              ),
              this.addTextAreaInline("explanation", "Erläuterungen", this.id, {
                hasInlineContextHelp: true,
                wrappers: ["inline-help", "form-field"],
              }),
            ],
            { className: "optional" },
          ),
        ]),
      ]),

      this.addSpatialSection(),
      this.addTimeReferenceSection(),
      this.addAdditionalInformationSection({ extraInfoLangData: true }),
      this.addAvailabilitySection(),
      this.addLinksSection(),
    ];

    return this.manipulateDocumentFields(fields);
  };
}
