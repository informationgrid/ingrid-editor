import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslocoService } from "@ngneat/transloco";

export function registerTranslateExtension(transloco: TranslocoService) {
  return {
    validationMessages: [
      {
        name: "required",
        message: () => transloco.translate("form.validationMessages.required"),
      },
      {
        name: "email",
        message: () => transloco.translate("form.validationMessages.email"),
      },
      {
        name: "emailInRepeat",
        message: () =>
          transloco.translate("form.validationMessages.emailInRepeat"),
      },
      {
        name: "lowercase",
        message: () => transloco.translate("form.validationMessages.lowercase"),
      },
      {
        name: "url",
        message: () => transloco.translate("form.validationMessages.url"),
      },
      {
        name: "matDatepickerMin",
        message: () =>
          transloco.translate("form.validationMessages.matDatepickerMin"),
      },
      {
        name: "matDatepickerMax",
        message: () =>
          transloco.translate("form.validationMessages.matDatepickerMax"),
      },
      {
        name: "min",
        message: (error: any, field: FormlyFieldConfig) => {
          transloco.translate("form.validationMessages.min", {
            value: field.props.min,
          });
        },
      },
      {
        name: "max",
        message: (error: any, field: FormlyFieldConfig) => {
          transloco.translate("form.validationMessages.max", {
            value: field.props.max,
          });
        },
      },
    ],
  };
}
