import { DocumentService } from "../../app/services/document/document.service";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { AddressOptions, AddressShared } from "./address.shared";

export class PersonDoctype extends AddressShared {
  label = "Person";

  iconClass = "Freie-Adresse";

  isAddressType = true;

  options: Partial<AddressOptions> = {};

  private fieldWithAddressReferences: string;

  documentFields() {
    return <FormlyFieldConfig[]>[
      this.addSection(
        "Persönliche Daten",
        [
          {
            wrappers: ["panel"],
            props: {
              externalLabel: "Anrede",
              required: false,
            },
            fieldGroup: [
              {
                fieldGroupClassName: "display-flex width-50",
                fieldGroup: [
                  this.addAutoCompleteInline("salutation", "Anrede", {
                    wrappers: ["inline-help", "form-field"],
                    hasInlineContextHelp: true,
                    highlightMatches: true,
                    hideDeleteButton: true,
                    placeholder: "",
                    options: this.getCodelistForSelect(4300, "salutation"),
                    codelistId: 4300,
                  }),
                  this.addAutoCompleteInline("academic-title", "Titel", {
                    wrappers: ["inline-help", "form-field"],
                    className: "flex-1 pad-right",
                    hasInlineContextHelp: true,
                    highlightMatches: true,
                    hideDeleteButton: true,
                    placeholder: "",
                    options: this.getCodelistForSelect(4305, "academic-title"),
                    codelistId: 4305,
                  }),
                ],
              },
            ],
          },
          {
            wrappers: ["panel"],
            props: {
              externalLabel: "Name",
              required: true,
              contextHelpId: "name",
            },
            fieldGroup: [
              {
                fieldGroupClassName: "display-flex",
                fieldGroup: [
                  this.addInput("firstName", null, {
                    fieldLabel: "Vorname",
                    className: "flex-1 firstName",
                  }),
                  this.addInput("lastName", null, {
                    fieldLabel: "Nachname",
                    className: "flex-1 lastName",
                    required: true,
                  }),
                ],
              },
            ],
          },
          this.options.publicationArea ? this.addPublicationArea() : null,
          this.addCheckbox("hideAddress", null, {
            fieldLabel:
              "für Anzeige Daten der übergeordneten Organisation verwenden",
            expressions: {
              hide: "!model?._parent || formState.parentIsFolder",
            },
          }),
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
