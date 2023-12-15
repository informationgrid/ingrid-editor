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

export const messagesFields: FormlyFieldConfig[] = [
  {
    key: "messages",
    type: "table",
    props: {
      externalLabel: "Benachrichtigungen",
      columns: [
        {
          key: "text",
          type: "input",
          label: "Titel",
          width: "300px",
          props: {
            label: "Text",
            appearance: "outline",
          },
        },
        {
          key: "validUntil",
          type: "datepicker",
          label: "Gültig bis",
          width: "100px",
          props: {
            label: "Gültig bis",
            appearance: "outline",
            formatter: (item: any) => {
              return item ? new Date(item).toLocaleDateString() : "";
            },
          },
        },
      ],
    },
  },
];
