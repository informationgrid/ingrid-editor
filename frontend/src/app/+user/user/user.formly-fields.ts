import { FormlyFieldConfig } from "@ngx-formly/core";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { SelectOption } from "../../services/codelist/codelist.service";
import { Group } from "../../models/user-group";

export const getUserFormFields = (
  roles: SelectOption[],
  groups: Observable<Group[]>
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
        disabled: true,
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
        externalLabel: "Gruppen",
        placeholder: "Gruppe wählen...",
        options: groups.pipe(
          map((groups) => {
            return groups.map((group) => {
              return {
                label: group.name,
                value: group.id,
              };
            });
          })
        ),
        elementIcon: "group",
        asSelect: true,
      },
    },
  ];
};
/*

@Injectable()
export class UserFormlyFields {
  constructor() {}

  static getFields(
    roles: SelectOption[],
    groups: Observable<Group[]>
  ): FormlyFieldConfig[] {
    return <FormlyFieldConfig[]>[
      {
        key: "login",
        type: "input",
        wrappers: ["panel", "form-field"],
        templateOptions: {
          externalLabel: "Login",
          appearance: "outline",
          required: true,
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
          externalLabel: "Gruppen",
          placeholder: "Gruppe wählen...",
          options: groups.pipe(
            map((groups) => {
              return groups.map((group) => {
                return {
                  label: group.name,
                  value: group.id,
                };
              });
            })
          ),
          asSelect: true,
        },
      },
    ];
  }

  ngOnInit() {}
}
*/
