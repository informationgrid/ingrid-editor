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
export class DataCollectionDoctype extends IngridShared {
  id = "InGridDataCollection";

  label = "Datenbank";

  iconClass = "Datensammlung";

  hasOptionalFields = true;

  constructor() {
    super();
    this.options.hide.openData = false;
  }

  documentFields = () => {
    const fields = <FormlyFieldConfig[]>[
      this.addGeneralSection(),
      this.addKeywordsSection(),

      this.addSection("Fachbezug", [
        this.addRepeat("categoryCatalog", "Objektartenkatalog", {
          expressions: {
            "props.required":
              "formState.mainModel?.databaseContent?.length > 0",
            className: "field.props.required ? '' : 'optional'",
          },
          fields: [
            this.addAutocomplete("title", "Titel", {
              className: "flex-3",
              wrappers: ["form-field"],
              required: true,
              options: this.getCodelistForSelect("3535", "title"),
              codelistId: "3535",
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
          },
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

    return this.manipulateDocumentFields(fields);
  };
}
