import { FormlyFieldConfig } from "@ngx-formly/core";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { SelectOption } from "../../../services/codelist/codelist.service";

export const getNewUserFormFields = (
  roles: SelectOption[],
  logins: Observable<SelectOption[]>
): FormlyFieldConfig[] => {
  return [
    /*    {
      key: "login",
      type: "input",
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: "Login",
        appearance: "outline",
        required: true,
        disabled: true,
      },
    },*/
    {
      key: "login",
      type: "autocomplete",
      wrappers: ["panel"],
      templateOptions: {
        externalLabel: "Login",
        // placeholder: "Bitte wählen",
        appearance: "outline",
        required: true,
        options: logins,
      },
    },
    {
      key: "role",
      type: "select",
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: "Rolle",
        label: "Rolle",
        appearance: "outline",
        required: true,
        options: of(roles),
      },
    },
    {
      wrappers: ["panel"],
      templateOptions: {
        externalLabel: "Name",
        required: true,
      },
      fieldGroup: [
        {
          fieldGroupClassName: "display-flex",
          fieldGroup: [
            {
              key: "firstName",
              className: "flex-1 firstName",
              type: "input",
              templateOptions: {
                label: "Vorname",
                appearance: "outline",
              },
            },
            {
              key: "lastName",
              className: "flex-1 lastName",
              type: "input",
              templateOptions: {
                label: "Nachname",
                appearance: "outline",
              },
            },
          ],
        },
      ],
    },
    {
      key: "email",
      type: "input",
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: "E-Mail",
        appearance: "outline",
        required: true,
      },
    },
  ];
};
