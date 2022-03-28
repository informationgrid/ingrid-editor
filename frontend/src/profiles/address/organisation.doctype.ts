import { DocumentService } from "../../app/services/document/document.service";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { BaseDoctype } from "../base.doctype";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { map } from "rxjs/operators";

export abstract class OrganisationDoctype extends BaseDoctype {
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
        {
          key: "contact",
          type: "repeat",
          wrappers: ["panel"],
          className: "contact",
          templateOptions: {
            externalLabel: "Kontakt",
            required: true,
          },
          fieldArray: {
            fieldGroupClassName: "display-flex",
            fieldGroup: [
              this.addSelect("type", null, {
                className: "flex-1",
                wrappers: null,
                fieldLabel: "Art",
                required: true,
                options: this.getCodelistForSelect(4430, "type").pipe(
                  map((items) =>
                    items.filter(
                      (item) => item.value !== "5" && item.value !== "6"
                    )
                  )
                ),
              }),
              this.addInput("connection", null, {
                fieldLabel: "Verbindung",
                required: true,
                className: "flex-3",
                validators: {
                  validation: ["emailInRepeat"],
                },
              }),
            ],
          },
        },
        this.addGroup(
          "address",
          "Adresse",
          [
            {
              fieldGroupClassName: "display-flex",
              fieldGroup: [
                this.addInput("street", null, {
                  fieldLabel: "Straße/Hausnummer",
                  className: "width-100",
                }),
              ],
            },
            {
              fieldGroupClassName: "display-flex",
              fieldGroup: [
                this.addInput("zip-code", null, {
                  fieldLabel: "PLZ",
                }),
                this.addInput("city", null, {
                  fieldLabel: "Ort",
                  className: "flex-3",
                }),
              ],
            },
            {
              fieldGroupClassName: "display-flex",
              fieldGroup: [
                this.addInput("zip-po-box", null, {
                  fieldLabel: "PLZ (Postfach)",
                }),
                this.addInput("po-box", null, {
                  fieldLabel: "Postfach",
                  className: "flex-3",
                }),
              ],
            },
            {
              fieldGroupClassName: "display-flex",
              fieldGroup: [
                this.addSelect("administrativeArea", null, {
                  fieldLabel: "Verwaltungsgebiet",
                  showSearch: true,
                  wrappers: null,
                  className: "flex-1",
                  options: this.getCodelistForSelect(110, "administrativeArea"),
                  codelistId: 110,
                }),
                this.addSelect("country", null, {
                  fieldLabel: "Land",
                  showSearch: true,
                  wrappers: null,
                  className: "flex-1",
                  options: this.getCodelistForSelect(6200, "country"),
                  codelistId: 6200,
                }),
              ],
            },
          ],
          { fieldGroupClassName: null }
        ),
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
