import { DocumentService } from "../../app/services/document/document.service";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { AddressOptions, AddressShared } from "./address.shared";

export class PersonDoctype extends AddressShared {
  label = "Person";

  iconClass = "Freie-Adresse";

  isAddressType = true;

  options: Partial<AddressOptions>;

  private fieldWithAddressReferences: string;

  documentFields() {
    return <FormlyFieldConfig[]>[
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
            contextHelpId: "name",
          },
          fieldGroup: [
            {
              fieldGroupClassName: "display-flex",
              fieldGroup: [
                this.addInput("firstName", "Vorname", {
                  fieldLabel: "Vorname",
                  className: "flex-1 firstName",
                }),
                this.addInput("lastName", "Nachname", {
                  fieldLabel: "Nachname",
                  className: "flex-1 lastName",
                  required: true,
                }),
              ],
            },
          ],
        },

        this.addCheckbox("hideAddress", null, {
          fieldLabel:
            "für Anzeige Daten der übergeordneten Organisation verwenden",
          hideExpression:
            "!formState.mainModel._parent ||  formState.parentIsFolder",
        }),
      ]),
      this.addSection("Kommunikation", [
        this.addContact(),
        this.addAddressSection(this.options),
      ]),
      this.addReferencesForAddress(this.fieldWithAddressReferences),
    ];
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
