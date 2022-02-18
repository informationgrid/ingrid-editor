import { FormlyFieldConfig } from "@ngx-formly/core";
import { Observable, of } from "rxjs";
import { SelectOptionUi } from "../../../services/codelist/codelist.service";

export const getNewUserFormFields = (
  roles: SelectOptionUi[],
  logins: Observable<SelectOptionUi[]>
): FormlyFieldConfig[] => {
  return [
    {
      key: "login",
      type: "autocomplete",
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: "Login",
        // placeholder: "Bitte wählen",
        appearance: "outline",
        required: true,
        options: logins,
        simple: true,
      },
      // focus: true, // throws expression has changed error
      validators: {
        validation: ["lowercase"],
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
                required: true,
              },
            },
            {
              key: "lastName",
              className: "flex-1 lastName",
              type: "input",
              templateOptions: {
                label: "Nachname",
                appearance: "outline",
                required: true,
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
      validators: {
        validation: ["email"],
      },
    },
  ];
};
