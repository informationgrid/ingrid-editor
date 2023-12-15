/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { SelectOptionUi } from "../../../services/codelist/codelist.service";

export const getNewUserFormFields = (
  roles: SelectOptionUi[],
  logins: SelectOptionUi[],
  groups: SelectOptionUi[],
): FormlyFieldConfig[] => {
  return [
    {
      fieldGroup: [
        {
          key: "login",
          type: "autocomplete",
          wrappers: ["panel", "form-field"],
          props: {
            externalLabel: "Login",
            // placeholder: "Bitte wählen...",
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
          type: "ige-select",
          wrappers: ["panel", "form-field"],
          props: {
            externalLabel: "Rolle",
            label: "Rolle",
            appearance: "outline",
            required: true,
            options: of(roles),
            simple: true,
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
                    label: "Vorname",
                    appearance: "outline",
                    required: true,
                  },
                },
                {
                  key: "lastName",
                  className: "flex-1 lastName",
                  type: "input",
                  props: {
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
          props: {
            externalLabel: "E-Mail",
            appearance: "outline",
            description:
              'An die angegebene Mail-Adresse wird bei Klick auf "Anlegen" eine automatische E-Mail mit dem Passwort versendet.',
            required: true,
          },
          validators: {
            validation: ["email"],
          },
        },
      ],
      expressions: {
        className: "formState.showGroups ? 'hide' : ''",
      },
    },
    {
      key: "groups",
      type: "repeatList",
      wrappers: ["panel"],
      props: {
        externalLabel: "Gruppen",
        placeholder: "Gruppe wählen...",
        appearance: "outline",
        required: true,
        options: of(groups),
        noDrag: true,
        elementIcon: "group",
        asSelect: true,
      },
      expressions: {
        className: "formState.showGroups ? '' : 'hide'",
        "props.required": "formState.showGroups",
      },
    },
  ];
};
