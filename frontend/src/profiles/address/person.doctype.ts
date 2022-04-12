import { DocumentService } from "../../app/services/document/document.service";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { AddressShared } from "./address.shared";
import { BackendOption } from "../../app/store/codelist/codelist.model";

interface PersonOptions {
  defaultCountry: BackendOption;
  hideCountryAndAdministrativeArea: boolean;
  hideAdministrativeArea: boolean;
}

export class PersonDoctype extends AddressShared {
  label = "Person";

  iconClass = "Freie-Adresse";

  isAddressType = true;

  options: Partial<PersonOptions>;

  private fieldWithAddressReferences: string;

  documentFields() {
    const fields = <FormlyFieldConfig[]>[
      this.addSection("Persönliche Daten", [
        {
          wrappers: ["panel"],
          templateOptions: {
            externalLabel: "Anrede",
            required: false,
          },
          fieldGroup: [
            {
              fieldGroupClassName: "display-flex width-50",
              fieldGroup: [
                this.addAutocomplete("salutation", "Anrede", {
                  wrappers: ["form-field"],
                  className: "flex-1",
                  placeholder: "Anrede",
                  highlightMatches: true,
                  hideDeleteButton: true,
                  options: this.getCodelistForSelect(4300, "salutation"),
                }),
                this.addAutocomplete("academic-title", "Titel", {
                  wrappers: ["form-field"],
                  className: "flex-1 pad-right",
                  placeholder: "Titel",
                  highlightMatches: true,
                  hideDeleteButton: true,
                  options: this.getCodelistForSelect(4305, "academic-title"),
                }),
              ],
            },
          ],
        },
        {
          wrappers: ["panel"],
          templateOptions: {
            externalLabel: "Name",
            required: true,
          },
          fieldGroup: [
            {
              fieldGroupClassName: "display-flex",
              fieldGroup: [
                this.addInput("firstName", "Vorname", {
                  className: "flex-1 firstName",
                }),
                this.addInput("lastName", "Nachname", {
                  className: "flex-1 lastName",
                  required: true,
                }),
              ],
            },
          ],
        },
      ]),
      this.addSection("Kommunikation", [
        this.addContact(),
        this.addAddressSection({
          defaultCountry: this.options?.defaultCountry,
        }),
      ]),
      this.addReferencesForAddress(this.fieldWithAddressReferences),
    ];

    if (this.options?.hideAdministrativeArea) {
      const country =
        fields[1].fieldGroup[1].fieldGroup[1].fieldGroup[3]["fieldGroup"][1];
      country.className = null;
      delete fields[1].fieldGroup[1].fieldGroup[1].fieldGroup[3];
      fields[1].fieldGroup[1].fieldGroup[1].fieldGroup.push(country);
    }
    if (this.options?.hideCountryAndAdministrativeArea) {
      delete fields[1].fieldGroup[1].fieldGroup[1].fieldGroup[3];
    }
    return fields;
  }

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery,
    fieldWithAddressReferences: string
  ) {
    super(codelistService, codelistQuery);
    this.fieldWithAddressReferences = fieldWithAddressReferences;
  }
}
