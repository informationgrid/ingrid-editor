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
import {
  UntypedFormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { isNotEmptyObject } from "../shared/utils";

export const REGEX_URL =
  "^(https?://)([0-9a-zA-Z.-]+)\\.([0-9a-z.]{2,6})(:\\d+)?(/.*)?";

export function IpValidator(control: UntypedFormControl): ValidationErrors {
  return /(\d{1,3}\.){3}\d{1,3}/.test(control.value?.trim())
    ? null
    : { ip: true };
}

export function EmailValidator(control: UntypedFormControl): ValidationErrors {
  return /^.+@.+\.\w+$/.test(control.value?.trim()) ? null : { email: true };
}

export function NotEmptyArrayValidator(
  control: UntypedFormControl,
): ValidationErrors {
  const value: any[] = control.value;
  const result = value.every((item) => isNotEmptyObject(item));
  return result
    ? null
    : { hasEmptyRows: { message: "Es dürfen keine leeren Zeilen vorkommen" } };
}

export function PositiveNumValidator(control: UntypedFormControl) {
  return control.value == undefined || control.value >= 0
    ? null
    : { positiveNum: { message: "Der Wert darf nicht negativ sein" } };
}

const regExp = new RegExp(REGEX_URL);

export function UrlValidator(control: UntypedFormControl): ValidationErrors {
  return !control.value || regExp.test(control.value?.trim())
    ? null
    : { url: true };
}

export function LowercaseValidator(
  control: UntypedFormControl,
): ValidationErrors {
  return control.value === control.value?.toLowerCase()
    ? null
    : { lowercase: true };
}

export function NoSpaceValidator(
  control: UntypedFormControl,
): ValidationErrors {
  return control.value?.indexOf(" ") === -1 ? null : { no_space: true };
}

const forbiddenESCharsRegExp = new RegExp(/^[^,/*?"<>|:#\\]+$/);

export function ElasticsearchAliasValidator(
  control: UntypedFormControl,
): ValidationErrors {
  return !control.value || forbiddenESCharsRegExp.test(control.value?.trim())
    ? null
    : { valid_es_alias: true };
}

export function patternWithMessage(
  pattern: string | RegExp,
  errorField: string,
  message?: string,
): ValidatorFn {
  const delegateFn = Validators.pattern(pattern);
  return (control) => {
    if (delegateFn(control) === null) {
      return null;
    } else {
      const error = {};
      if (message) error[errorField] = { message };
      else error[errorField] = true;
      return error;
    }
  };
}
