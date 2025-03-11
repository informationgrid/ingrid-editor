/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { AddressOptions, AddressShared } from "../../address/address.shared";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class PublicationAddressDoctype extends AddressShared {
  label = "Literaturadresse";

  id = "PublicationAddressDoc";

  iconClass = "Institution";

  isAddressType = true;

  options: Partial<AddressOptions> = {};

  documentFields() {
    return <FormlyFieldConfig[]>[
      this.addSection(
        "Anzeige",
        [
          this.addInput("organization", "Bezeichnung", {
            required: true,
            className: "width-100 organization",
            wrappers: ["panel", "form-field"],
          }),
        ].filter(Boolean),
      ),
      this.addSection(
        "Kommunikation",
        [
          this.addContact(false),
          this.addAddressSection(this.options),
          ...(this.options.positionNameAndHoursOfService
            ? this.addPositionNameAndHoursOfService()
            : []),
        ].filter(Boolean),
      ),
      this.addSection("Zugeordnete Datensätze", [
        this.addReferencesForAddress("pointOfContact", null, "Andere"),
        this.addReferencesForAddress("publisher", null, "Als Herausgeber"),
      ]),
    ];
  }

  protected constructor() {
    super();
    this.options = {
      defaultCountry: { key: "276" },
      requiredField: { administrativeArea: true },
      positionNameAndHoursOfService: true,
    };

    this.addressType = "organization";
  }
}
