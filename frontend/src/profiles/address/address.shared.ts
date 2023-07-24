import { BaseDoctype } from "../base.doctype";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { map } from "rxjs/operators";
import { BackendOption } from "../../app/store/codelist/codelist.model";
import {
  EmailValidator,
  UrlValidator,
  UrlValidatorMessage,
} from "../../app/formly/input.validators";

export interface AddressOptions {
  defaultCountry: BackendOption;
  hideCountryAndAdministrativeArea: boolean;
  hideAdministrativeArea: boolean;
  inheritAddress: boolean;
  positionNameAndHoursOfService: boolean;
  requiredField: any;
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
          showSearch: true,
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
            validEmail: {
              expression: (ctrl) => {
                const type = ctrl.parent.value.type;
                return type?.key === "3" ? EmailValidator(ctrl) === null : true;
              },
              message: "Die Email ist ungültig",
            },
            validUrl: {
              expression: (ctrl) => {
                const type = ctrl.parent.value.type;
                return type?.key === "4" ? UrlValidator(ctrl) === null : true;
              },
              message: UrlValidatorMessage,
            },
          },
        }),
      ],
    });
  }

  addPositionNameAndHoursOfService(): FormlyFieldConfig[] {
    return [
      this.addTextArea(
        "positionName",
        "Position/nachgeordnete Abteilung",
        this.id
      ),
      this.addInput("hoursOfService", "Servicezeiten", {
        wrappers: ["panel", "form-field"],
      }),
    ];
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
          props: {
            label: "Anschrift aus übergeordneter Adresse übernehmen",
          },
          hideExpression: (_, formState) =>
            !options.inheritAddress ||
            !formState.mainModel?._parent ||
            formState.parentIsFolder,
        },
        {
          hideExpression: (model, formState) =>
            options.inheritAddress &&
            formState.mainModel?._parent &&
            !formState.parentIsFolder &&
            model.inheritAddress,
          fieldGroup: [
            {
              fieldGroupClassName: "flex-row",
              fieldGroup: [
                this.addInput("street", null, {
                  fieldLabel: "Straße/Hausnummer",
                  className: "width-100",
                  hasInlineContextHelp: true,
                  wrappers: ["inline-help", "form-field"],
                }),
              ],
            },
            {
              fieldGroupClassName: "flex-row",
              fieldGroup: [
                this.addInput("zip-code", null, {
                  fieldLabel: "PLZ",
                  hasInlineContextHelp: true,
                  wrappers: ["inline-help", "form-field"],
                }),
                this.addInput("city", null, {
                  fieldLabel: "Ort",
                  className: "flex-3",
                  hasInlineContextHelp: true,
                  wrappers: ["inline-help", "form-field"],
                }),
              ],
            },
            {
              fieldGroupClassName: "flex-row",
              fieldGroup: [
                this.addInput("zip-po-box", null, {
                  fieldLabel: "PLZ (Postfach)",
                  hasInlineContextHelp: true,
                  wrappers: ["inline-help", "form-field"],
                }),
                this.addInput("po-box", null, {
                  fieldLabel: "Postfach",
                  className: "flex-3",
                  hasInlineContextHelp: true,
                  wrappers: ["inline-help", "form-field"],
                }),
              ],
            },
            this.getAdministrativeAreaAndCountry(options),
          ],
        },
      ],
      { fieldGroupClassName: "" }
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
    const administrativeArea = this.addAutoCompleteInline(
      "administrativeArea",
      "Verwaltungsgebiet",
      {
        options: this.getCodelistForSelect(6250, "administrativeArea"),
        codelistId: 6250,
        required:
          options.requiredField && options.requiredField["administrativeArea"],
      }
    );

    return options.hideAdministrativeArea
      ? country
      : {
          fieldGroupClassName: "flex-row",
          fieldGroup: [administrativeArea, country],
        };
  }
}
