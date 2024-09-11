import { Injectable } from "@angular/core";
import { FormlyFieldConfig, FormlyFieldProps } from "@ngx-formly/core";
import { BaseDoctype } from "../../base.doctype";
import { FormlyFieldInput } from "@ngx-formly/material/input";

@Injectable({
  providedIn: "root",
})
export class CommonFieldsBkg extends BaseDoctype {
  documentFields(): FormlyFieldConfig<
    FormlyFieldProps & { [additionalProperties: string]: any }
  >[] {
    throw new Error("Method not implemented.");
  }

  getAccessConstraints(): FormlyFieldConfig {
    return this.addGroupSimple(null, [
      this.addSelect("accessConstraintsBkg", "Zugriffsbeschränkungen BKG", {
        wrappers: ["panel", "form-field"],
        options: this.getCodelistForSelect("10001", "accessConstraintsBkg"),
        codelistId: "10001",
        expressions: {
          "props.hintStart": (field: FormlyFieldInput) => {
            const selectedKey = field.formControl.value?.key;
            const data = this.codelistQuery.getCodelistEntryByKey(
              "10001",
              selectedKey,
            )?.data;
            return data ? JSON.parse(data)?.de : "";
          },
        },
      }),
      this.addTextArea("accessConstraintsBkgComment", null, "bkg", {
        fieldLabel: "Kommentar",
      }),
    ]);
  }

  getUseConstraints(): FormlyFieldConfig {
    return this.addGroupSimple(null, [
      this.addSelect("useConstraintsBkg", "Nutzungsbedingungen BKG", {
        wrappers: ["panel", "form-field"],
        options: this.getCodelistForSelect("10003", "useConstraintsBkg"),
        codelistId: "10003",
        expressions: {
          "props.hintStart": (field: FormlyFieldInput) => {
            const selectedKey = field.formControl.value?.key;
            const data = this.codelistQuery.getCodelistEntryByKey(
              "10003",
              selectedKey,
            )?.data;
            return data ? JSON.parse(data)?.de : "";
          },
        },
      }),
      this.addTextArea("useConstraintsBkgComment", null, "bkg", {
        fieldLabel: "Kommentar",
      }),
    ]);
  }
}
