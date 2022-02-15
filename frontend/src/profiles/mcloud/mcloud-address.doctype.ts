import { DocumentService } from "../../app/services/document/document.service";
import { CodelistService } from "../../app/services/codelist/codelist.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { BaseDoctype } from "../base.doctype";
import { CodelistQuery } from "../../app/store/codelist/codelist.query";
import { IgeDocument } from "../../app/models/ige-document";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class McloudAddressDoctype extends BaseDoctype {
  id = "McloudAddressDoc";

  label = "Adresse";

  iconClass = "Institution";

  isAddressType = true;

  documentFields = () =>
    <FormlyFieldConfig[]>[
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
            minLength: 1,
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
          ],
          { fieldGroupClassName: null }
        ),
      ]),
    ];

  constructor(
    storageService: DocumentService,
    codelistService: CodelistService,
    codelistQuery: CodelistQuery
  ) {
    super(codelistService, codelistQuery);
  }

  getIconClass(doc: IgeDocument): string {
    return doc.organization?.length > 0 ? "Institution" : "Freie-Adresse";
  }
}
