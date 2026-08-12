/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { isNotEmptyObject } from "../shared/utils";

export const REGEX_URL =
  "^(https?://)(([0-9a-zA-Z.-]+)\\.([0-9a-z.]{2,6})|localhost)(:\\d+)?(/.*)?$";
export const REGEX_URL_WITH_IP_ALIAS =
  "^(https?://)(([0-9a-zA-Z.-]+)|localhost)(:\\d+)?(/.*)?$";

export function IpValidator(control: AbstractControl): ValidationErrors {
  return /(\d{1,3}\.){3}\d{1,3}/.test(control.value?.trim())
    ? null
    : { ip: true };
}

export function EmailValidator(control: AbstractControl): ValidationErrors {
  return /^.+@.+\.\w+$/.test(control.value?.trim()) ? null : { email: true };
}

export function NotEmptyArrayValidator(
  control: AbstractControl,
): ValidationErrors {
  const value: any[] = control.value;
  const result = value.every((item) => isNotEmptyObject(item));
  return result
    ? null
    : { hasEmptyRows: { message: "Es dürfen keine leeren Zeilen vorkommen" } };
}

export function PositiveNumValidator(control: AbstractControl) {
  return control.value == undefined || control.value >= 0
    ? null
    : { positiveNum: { message: "Der Wert darf nicht negativ sein" } };
}

const regExp = new RegExp(REGEX_URL);

export function UrlValidator(control: AbstractControl): ValidationErrors {
  return !control.value || regExp.test(control.value?.trim())
    ? null
    : { url: true };
}

const regExpIpAlias = new RegExp(REGEX_URL_WITH_IP_ALIAS);
export function UrlValidatorWithIpAlias(
  control: AbstractControl,
): ValidationErrors {
  return !control.value || regExpIpAlias.test(control.value?.trim())
    ? null
    : { url: true };
}

export function LowercaseValidator(control: AbstractControl): ValidationErrors {
  return control.value === control.value?.toLowerCase()
    ? null
    : { lowercase: true };
}

export function NoSpaceValidator(control: AbstractControl): ValidationErrors {
  return control.value?.indexOf(" ") === -1 ? null : { no_space: true };
}

const forbiddenESCharsRegExp = new RegExp(/^[^,/*?"<>|:#\\]+$/);

export function ElasticsearchAliasValidator(
  control: AbstractControl,
): ValidationErrors {
  return !control.value || forbiddenESCharsRegExp.test(control.value?.trim())
    ? null
    : { valid_es_alias: true };
}

const doiPrefixRegExp = new RegExp(/^10\.\d{4,}$/);

export function DoiPrefixValidator(control: AbstractControl): ValidationErrors {
  return !control.value || doiPrefixRegExp.test(control.value?.trim())
    ? null
    : { doi_prefix: true };
}

const doiRegExp = new RegExp(/^10\.\d{4,}\/.+$/);

export function DoiValidator(control: AbstractControl): ValidationErrors {
  return !control.value || doiRegExp.test(control.value?.trim())
    ? null
    : { doi: { message: "Benötigtes Format: 10.VXYZ/ABC..." } };
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

export function JsonValidator(control: AbstractControl): ValidationErrors {
  if (
    control.value === null ||
    control.value === undefined ||
    control.value.toString().trim() === ""
  ) {
    return null;
  }

  const error = {
    valid_json: {
      message: "Bitte geben Sie ein gültiges JSON-Objekt ein.",
    },
  };

  try {
    const parsed = JSON.parse(control.value);
    return typeof parsed === "object" && parsed !== null ? null : error;
  } catch {
    return error;
  }
}
