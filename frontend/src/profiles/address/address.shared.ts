import { BaseDoctype } from "../base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { map } from "rxjs/operators";
import { BackendOption } from "../../app/store/codelist/codelist.model";

export interface AddressOptions {
  defaultCountry: BackendOption;
  hideCountryAndAdministrativeArea: boolean;
  hideAdministrativeArea: boolean;
  inheritAddress: boolean;
}

export abstract class AddressShared extends BaseDoctype {
  addContact(): FormlyFieldConfig {
    return this.addRepeat("contact", "Kontakt", {
      className: "contact",
      required: true,
      fields: [
        this.addSelect("type", "Art", {
          fieldLabel: "Art",
          wrappers: null,
          className: "flex-1",
          required: true,
          options: this.getCodelistForSelect(4430, "type").pipe(
            map((items) =>
              items.filter((item) => item.value !== "5" && item.value !== "6")
            )
          ),
          codelistId: 4430,
        }),
        this.addInput("connection", "Verbindung", {
          fieldLabel: "Verbindung",
          className: "flex-3",
          required: true,
          validators: {
            validation: ["emailInRepeat"],
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
          key: "inheritAddress",
          type: "toggle",
          defaultValue: options.inheritAddress,
          templateOptions: {
            label: "Anschrift aus übergeordneter Adresse übernehmen",
          },
          hideExpression: (_, formState) =>
            !options.inheritAddress ||
            !formState.mainModel._parent ||
            formState.parentIsFolder,
        },
        {
          hideExpression: (model, formState) =>
            options.inheritAddress &&
            formState.mainModel._parent &&
            !formState.parentIsFolder &&
            model.inheritAddress,
          fieldGroup: [
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
            this.getAdministrativeAreaAndCountry(options),
          ],
        },
      ],
      { fieldGroupClassName: null }
    );
  }

  private getAdministrativeAreaAndCountry(options: Partial<AddressOptions>) {
    if (options.hideCountryAndAdministrativeArea) return {};

    const country = this.addSelect("country", null, {
      fieldLabel: "Land",
      showSearch: true,
      wrappers: null,
      className: options.hideAdministrativeArea ? null : "flex-1",
      options: this.getCodelistForSelect(6200, "country"),
      codelistId: 6200,
      defaultValue: options?.defaultCountry,
    });
    const administrativeArea = this.addSelect("administrativeArea", null, {
      fieldLabel: "Verwaltungsgebiet",
      showSearch: true,
      wrappers: null,
      className: "flex-1",
      options: this.getCodelistForSelect(110, "administrativeArea"),
      codelistId: 110,
    });

    return options.hideAdministrativeArea
      ? country
      : {
          fieldGroupClassName: "display-flex",
          fieldGroup: [administrativeArea, country],
        };
  }
}
