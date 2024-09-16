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
import { AddressOptions, AddressShared } from "./address.shared";

export abstract class OrganisationDoctype extends AddressShared {
  label = "Organisation";

  iconClass = "Institution";

  isAddressType = true;

  options: Partial<AddressOptions> = {};

  private fieldWithAddressReferences: string;

  documentFields() {
    return <FormlyFieldConfig[]>[
      this.addSection(
        "Organisationsdaten",
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
          this.addContact(),
          this.addAddressSection(this.options),
          ...(this.options.positionNameAndHoursOfService
            ? this.addPositionNameAndHoursOfService()
            : []),
        ].filter(Boolean),
      ),
      this.addReferencesForAddress(this.fieldWithAddressReferences),
    ];
  }

  protected constructor(fieldWithAddressReferences: string) {
    super();
    this.fieldWithAddressReferences = fieldWithAddressReferences;
    this.addressType = "organization";
  }
}
