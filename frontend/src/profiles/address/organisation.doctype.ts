import { DocumentService } from "../../app/services/document/document.service";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
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
          this.options.publicationArea ? this.addPublicationArea() : null,
        ].filter(Boolean)
      ),
      this.addSection(
        "Kommunikation",
        [
          this.addContact(),
          this.addAddressSection(this.options),
          ...(this.options.positionNameAndHoursOfService
            ? this.addPositionNameAndHoursOfService()
            : []),
        ].filter(Boolean)
      ),
      this.addReferencesForAddress(this.fieldWithAddressReferences),
    ];
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
