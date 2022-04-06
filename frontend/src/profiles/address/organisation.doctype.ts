import { DocumentService } from "../../app/services/document/document.service";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { AddressShared } from "./address.shared";

export abstract class OrganisationDoctype extends AddressShared {
  label = "Organisation";

  iconClass = "Institution";

  isAddressType = true;

  hideCountryAndAdministrativeArea = false;
  hideAdministrativeArea = false;

  private fieldWithAddressReferences: string;

  documentFields() {
    const fields = <FormlyFieldConfig[]>[
      this.addSection("Organisationsdaten", [
        {
          wrappers: ["panel"],
          templateOptions: {
            externalLabel: "Organisation",
            required: true,
          },
          fieldGroup: [
            {
              fieldGroupClassName: "",
              fieldGroup: [
                this.addInput("organization", null, {
                  fieldLabel: "Organisation",
                  required: true,
                  className: "width-100 organization",
                }),
              ],
            },
          ],
        },
      ]),
      this.addSection("Kommunikation", [
        this.addContact(),
        this.addAddressSection(),
      ]),
      this.addReferencesForAddress(this.fieldWithAddressReferences),
    ];

    if (this.hideAdministrativeArea) {
      const country = fields[1].fieldGroup[1].fieldGroup[3]["fieldGroup"][1];
      country.className = null;
      delete fields[1].fieldGroup[1].fieldGroup[3];
      fields[1].fieldGroup[1].fieldGroup.push(country);
    }
    if (this.hideCountryAndAdministrativeArea) {
      delete fields[1].fieldGroup[1].fieldGroup[3];
    }
    return fields;
  }

  protected constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    fieldWithAddressReferences: string
  ) {
    super(codelistService, codelistQuery);
    this.fieldWithAddressReferences = fieldWithAddressReferences;
  }
}
