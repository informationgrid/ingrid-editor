import { FormFieldHelper } from "../../../profiles/form-field-helper";
import { Injectable } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";

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
              options: [],
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
            this.addSelectInline("exporter", "Exporter", {
              required: true,
              simple: true,
              options: [],
            }),
          ],
          { fieldGroupClassName: "flex-row gap-6", className: "flex-1" },
        ),
      ],
    }),
  ];
}
