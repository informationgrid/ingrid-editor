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
import { FormFieldHelper } from "../../../profiles/form-field-helper";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ConnectionForm extends FormFieldHelper {
  fields: FormlyFieldConfig[] = [
    this.addRepeat("connections", "", {
      wrappers: [],
      menuOptions: [
        {
          key: "ibus",
          value: "iBus",
          fields: {
            fieldGroup: [...this.addFieldsForIBus()],
          },
        },
        {
          key: "elastic",
          value: "Elasticsearch",
          fields: {
            fieldGroup: this.addFieldsForElastic(),
          },
        },
      ],
    }),
  ];

  private addFieldsForIBus() {
    return [
      { key: "_type" },
      { key: "id" },
      this.addInputInline("name", "Name", {
        className: "white-bg url",
        required: true,
        updateOn: "change",
      }),
      this.addGroupSimple(
        null,
        [
          this.addInputInline("ip", "IP", {
            className: "flex-1 white-bg ip",
            required: true,
            updateOn: "change",
          }),
          this.addInputInline("port", "Port", {
            className: "flex-1 white-bg port",
            required: true,
            type: "number",
            defaultValue: 9900,
            updateOn: "change",
          }),
        ],
        {
          fieldGroupClassName: "flex-row gap-6",
        },
      ),
    ];
  }
  private addFieldsForElastic() {
    return [
      { key: "_type" },
      { key: "id" },
      this.addInputInline("name", "Name", {
        className: "white-bg url",
        required: true,
        updateOn: "change",
      }),
      this.addRepeatListInline("hosts", "Hosts", { asSimpleValues: true }),
      this.addInputInline("username", "Benutzername", {
        className: "flex-1 white-bg ip",
        required: true,
        updateOn: "change",
      }),
      this.addInputInline("password", "Passwort", {
        className: "flex-1 white-bg port",
        required: true,
        type: "number",
        updateOn: "change",
      }),
    ];
  }
}
