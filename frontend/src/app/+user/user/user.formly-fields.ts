import { FormlyFieldConfig } from "@ngx-formly/core";
import { of } from "rxjs";
import { SelectOptionUi } from "../../services/codelist/codelist.service";
import { Group } from "../../models/user-group";
import { FormlyAttributeEvent } from "@ngx-formly/core/lib/components/formly.field.config";

export const getUserFormFields = (
  roles: SelectOptionUi[],
  groups: Group[],
  groupClickCallback: (id: string) => void = undefined,
  roleChangeCallback: FormlyAttributeEvent = undefined
): FormlyFieldConfig[] => {
  return [
    {
      key: "login",
      type: "input",
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: "Login",
        appearance: "outline",
        required: true,
        disabled: true,
        simple: true,
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
        simple: true,
        change: roleChangeCallback,
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
                required: true,
                label: "Vorname",
                appearance: "outline",
              },
            },
            {
              key: "lastName",
              className: "flex-1 lastName",
              type: "input",
              templateOptions: {
                required: true,
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
      validators: {
        validation: ["email"],
      },
    },
    {
      key: "organisation",
      type: "input",
      wrappers: ["panel", "form-field"],
      templateOptions: {
        externalLabel: "Organisation",
        appearance: "outline",
      },
    },
    {
      key: "groups",
      type: "repeatList",
      wrappers: ["panel"],
      templateOptions: {
        selectionEmptyNotice:
          "Bitte weisen Sie dem Nutzer mindestens ein Gruppe zu",
        externalLabel: "Gruppen",
        placeholder: "Gruppe wählen...",
        options: groups.map((group) => {
          return {
            label: group.name,
            value: group.id + "",
          };
        }),
        onItemClick: groupClickCallback,
        noDrag: true,
        elementIcon: "group",
        asSelect: true,
      },
    },
  ];
};
