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
export class InformationSystemDoctype extends IngridShared {
  id = "InGridInformationSystem";

  label = "Anwendung";

  iconClass = "Informationssystem";

  hasOptionalFields = true;

  documentFields = () => {
    const fields = <FormlyFieldConfig[]>[
      this.addGeneralSection({
        inspireRelevant: true,
        advCompatible: true,
      }),
      this.addKeywordsSection({
        advProductGroup: true,
      }),

      this.addSection("Fachbezug", [
        this.addSelect("serviceType", "Art des Dienstes", {
          showSearch: true,
          options: this.getCodelistForSelect("5300", "serviceType"),
          codelistId: "5300",
        }),
        this.addRepeatList("serviceVersion", "Version", {
          asAutocomplete: true,
        }),
        this.addGroup(
          null,
          "Weitere Informationen",
          [
            this.addTextAreaInline(
              "systemEnvironment",
              "Systemumgebung",
              this.id,
              {
                hasInlineContextHelp: true,
                wrappers: ["inline-help", "form-field"],
              },
            ),
            this.addTextAreaInline(
              "implementationHistory",
              "Historie",
              this.id,
              {
                hasInlineContextHelp: true,
                wrappers: ["inline-help", "form-field"],
              },
            ),
          ],
          { className: "optional" },
        ),
        this.addGroup(
          null,
          null,
          [
            this.addTextAreaInline("baseDataText", "Basisdaten", this.id, {
              hasInlineContextHelp: true,
              wrappers: ["inline-help", "form-field"],
            }),
            this.addTextAreaInline("explanation", "Erläuterungen", this.id, {
              hasInlineContextHelp: true,
              wrappers: ["inline-help", "form-field"],
            }),
          ],
          { className: "optional" },
        ),
        this.addRepeat("serviceUrls", "Service-Urls", {
          className: "optional",
          fields: [
            this.addInputInline("name", "Name", { required: true }),
            this.addInputInline("url", "URL", {
              required: true,
              validators: {
                validation: ["url"],
              },
            }),
            this.addInputInline("description", "Erläuterung"),
          ],
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
