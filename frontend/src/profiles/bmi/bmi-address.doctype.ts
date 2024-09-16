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
import { Injectable } from "@angular/core";
import { OrganisationDoctype } from "../address/organisation.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { AddressOptions } from "../address/address.shared";
import { map } from "rxjs/operators";
import {
  EmailValidator,
  UrlValidator,
} from "../../app/formly/input.validators";

@Injectable({
  providedIn: "root",
})
export class BmiAddressDoctype extends OrganisationDoctype {
  id = "BmiAddressDoc";

  label = "Adresse";

  constructor() {
    super("addresses");
    this.addressType = "organization";
    this.options = {
      hideAdministrativeArea: true,
    };
  }

  addContact(): FormlyFieldConfig {
    return this.addRepeat("contact", "Kontakt", {
      className: "contact",
      required: true,
      validators: {
        needEmail: {
          expression: (ctrl) =>
            ctrl.value
              ? ctrl.value.some((row) => row.type?.key === "3")
              : false,
          message: "Es muss eine Email angegeben werden",
        },
      },
      fields: [
        this.addSelect("type", "Art", {
          fieldLabel: "Art",
          wrappers: ["form-field"],
          className: "flex-1",
          required: true,
          showSearch: true,
          options: this.getCodelistForSelect("4430", "type").pipe(
            map((items) =>
              items.filter((item) => item.value !== "5" && item.value !== "6"),
            ),
          ),
          codelistId: "4430",
        }),
        this.addInput("connection", "Verbindung", {
          fieldLabel: "Verbindung",
          className: "flex-3",
          required: true,
          validators: {
            validEmail: {
              expression: (ctrl) => {
                const type = ctrl.parent.value.type;
                return type?.key === "3" ? EmailValidator(ctrl) === null : true;
              },
              message: "Fehler: Die E-Mail ist ungültig",
            },
            validUrl: {
              expression: (ctrl) => {
                const type = ctrl.parent.value.type;
                return type?.key === "4" ? UrlValidator(ctrl) === null : true;
              },
              message: () =>
                this.transloco.translate("form.validationMessages.url"),
            },
          },
        }),
      ],
    });
  }

  addAddressSection(options: Partial<AddressOptions> = {}): FormlyFieldConfig {
    return this.addGroup(
      "address",
      "Anschrift",
      [
        {
          fieldGroup: [
            {
              fieldGroupClassName: "flex-row",
              fieldGroup: [
                this.addInput("street", null, {
                  fieldLabel: "Straße/Hausnummer",
                  className: "width-100",
                  wrappers: ["form-field"],
                }),
              ],
            },
            {
              fieldGroupClassName: "flex-row",
              fieldGroup: [
                this.addInput("zip-code", null, {
                  fieldLabel: "PLZ",
                  wrappers: ["form-field"],
                }),
                this.addInput("city", null, {
                  fieldLabel: "Ort",
                  className: "flex-3",
                  wrappers: ["form-field"],
                }),
              ],
            },
            this.addSelect("country", null, {
              fieldLabel: "Land",
              showSearch: true,
              wrappers: ["form-field"],
              className: options.hideAdministrativeArea ? null : "flex-1",
              options: this.getCodelistForSelect("6200", "country"),
              codelistId: "6200",
              defaultValue: options?.defaultCountry,
            }),
          ],
        },
      ],
      { fieldGroupClassName: "" },
    );
  }
}
