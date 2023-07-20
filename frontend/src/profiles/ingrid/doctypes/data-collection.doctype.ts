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

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addGeneralSection({ openData: true }),
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
}
