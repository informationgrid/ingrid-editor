/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
        name: "no_space",
        message: () => transloco.translate("form.validationMessages.no_space"),
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
