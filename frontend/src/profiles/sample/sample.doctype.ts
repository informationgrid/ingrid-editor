import { FormlyFieldConfig } from "@ngx-formly/core";
import { Injectable } from "@angular/core";
import { BaseDoctype } from "../base.doctype";

@Injectable({ providedIn: "root" })
export class SampleDoctype extends BaseDoctype {
  id = "SampleDoc";

  documentFields = () =>
    <FormlyFieldConfig[]>[
      this.addInput("sample_field", "Sample Field", {
        wrappers: ["panel", "form-field"],
      }),
      this.addAddressCard("addresses", "Addresses"),
    ];
}
