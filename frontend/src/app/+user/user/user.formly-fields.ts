/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { FormlyFieldConfig } from "@ngx-formly/core";
import { of } from "rxjs";
import { SelectOptionUi } from "../../services/codelist/codelist.service";
import { Group } from "../../models/user-group";
import { FormlyAttributeEvent } from "@ngx-formly/core/lib/models";

export const getUserFormFields = (
  roles: SelectOptionUi[],
  groups: Group[],
  groupClickCallback: (id: string) => void = undefined,
  roleChangeCallback: FormlyAttributeEvent = undefined,
): FormlyFieldConfig[] => {
  return [
    {
      key: "login",
      type: "input",
      wrappers: ["panel", "form-field"],
      props: {
        externalLabel: "Benutzername",
        appearance: "outline",
        required: true,
        disabled: true,
        simple: true,
      },
    },
    {
      key: "role",
      type: "ige-select",
      wrappers: ["panel", "form-field"],
      props: {
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
      props: {
        externalLabel: "Name",
        required: true,
      },
      fieldGroup: [
        {
          fieldGroupClassName: "flex-row",
          fieldGroup: [
            {
              key: "firstName",
              className: "flex-1 firstName",
              type: "input",
              props: {
                required: true,
                label: "Vorname",
                appearance: "outline",
              },
            },
            {
              key: "lastName",
              className: "flex-1 lastName",
              type: "input",
              props: {
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
      props: {
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
      props: {
        externalLabel: "Organisation",
        appearance: "outline",
      },
    },
    {
      key: "department",
      type: "input",
      wrappers: ["panel", "form-field"],
      props: {
        externalLabel: "Abteilung",
        appearance: "outline",
      },
    },
    {
      key: "phoneNumber",
      type: "input",
      wrappers: ["panel", "form-field"],
      props: {
        externalLabel: "Telefonnummer",
        appearance: "outline",
      },
    },
    {
      key: "groups",
      type: "repeatList",
      wrappers: ["panel"],
      defaultValue: [],
      props: {
        selectionEmptyNotice:
          "Bitte weisen Sie dem Benutzer mindestens eine Gruppe zu.",
        externalLabel: "Gruppen",
        placeholder: "Gruppe wählen...",
        options: groups
          .map((group) => {
            return {
              label: group.name,
              value: group.id + "",
            };
          })
          .sort((a, b) => a.label.localeCompare(b.label)),
        onItemClick: groupClickCallback,
        noDrag: true,
        elementIcon: "group",
        asSelect: true,
      },
    },
  ];
};
