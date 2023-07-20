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

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addGeneralSection({
        inspireRelevant: true,
        advCompatible: true,
        openData: true,
      }),
      this.addKeywordsSection(),

      this.addSection("Fachbezug", [
        this.addSelect("serviceType", "Art des Dienstes", {
          showSearch: true,
          options: this.getCodelistForSelect(5300, "serviceType"),
          codelistId: 5300,
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
              }
            ),
            this.addTextAreaInline(
              "implementationHistory",
              "Historie",
              this.id,
              {
                hasInlineContextHelp: true,
                wrappers: ["inline-help", "form-field"],
              }
            ),
          ],
          { className: "optional" }
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
          { className: "optional" }
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
}
