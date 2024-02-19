import { FormFieldHelper } from "../../../profiles/form-field-helper";
import { Injectable } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { SelectOption } from "../../services/codelist/codelist.service";

@Injectable({ providedIn: "root" })
export class IndexingFields extends FormFieldHelper {
  fields: FormlyFieldConfig[] = [
    this.addRepeat("catalog-index-config", "", {
      wrappers: [],
      className: "space-bottom flex-1",
      noDrag: true,
      fields: [
        this.addGroupSimple(
          null,
          [
            this.addSelectInline("target", "Ziel", {
              required: true,
              simple: true,
              options: [new SelectOption("ibus2", "My iBus2")],
            }),
            this.addSelectInline("tags", "Veröffentlichungsrecht", {
              defaultValue: ["internet"],
              required: true,
              multiple: true,
              simple: true,
              options: [
                { value: "internet", label: "Internet" },
                { value: "intranet", label: "Intranet" },
                { value: "amtsintern", label: "amtsintern" },
              ],
            }),
            this.addSelectInline("exporterId", "Exporter", {
              required: true,
              simple: true,
              options: [new SelectOption("exporter1", "My Exporter")],
            }),
          ],
          { fieldGroupClassName: "flex-row gap-6", className: "flex-1" },
        ),
      ],
    }),
  ];
}
