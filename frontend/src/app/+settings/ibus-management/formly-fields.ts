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

export const iBusFields: FormlyFieldConfig[] = [
  {
    type: "repeat",
    key: "ibus",
    wrappers: [],
    props: {
      noDrag: true,
    },
    fieldArray: {
      className: "space-bottom flex-1",
      fieldGroup: [
        {
          key: "url",
          type: "input",
          className: "white-bg url",
          props: {
            label: "URL",
            appearance: "outline",
            required: true,
          },
        },
        {
          fieldGroupClassName: "flex-row gap-6",
          fieldGroup: [
            {
              key: "ip",
              type: "input",
              className: "flex-1 white-bg ip",
              props: {
                label: "IP",
                appearance: "outline",
                required: true,
              },
            },
            {
              key: "port",
              type: "input",
              className: "flex-1 white-bg port",
              defaultValue: "9900",
              props: {
                type: "number",
                label: "Port",
                appearance: "outline",
                required: true,
              },
            },
          ],
        },
        {
          key: "publicationTypes",
          type: "ige-select",
          defaultValue: ["internet"],
          className: "white-bg publicationTypes",
          wrappers: ["form-field"],
          props: {
            label: "Veröffentlichungsrecht",
            placeholder: "",
            appearance: "outline",
            multiple: true,
            simple: true,
            required: true,
            options: [
              { value: "internet", label: "Internet" },
              { value: "intranet", label: "Intranet" },
              { value: "amtsintern", label: "amtsintern" },
            ],
          },
          modelOptions: {
            updateOn: "blur",
          },
        },
      ],
    },
  },
];
