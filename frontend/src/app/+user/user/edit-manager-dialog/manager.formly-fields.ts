import { FormlyFieldConfig } from "@ngx-formly/core";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { SelectOptionUi } from "../../../services/codelist/codelist.service";

export const getManagerFormFields = (
  logins: Observable<SelectOptionUi[]>
): FormlyFieldConfig[] => {
  return [
    {
      key: "manager",
      type: "select",
      wrappers: ["form-field"],
      templateOptions: {
        externalLabel: "Verantwortlicher",
        placeholder: "Bitte wählen",
        appearance: "outline",
        options: logins,
        required: true,
      },
    },
  ];
};
