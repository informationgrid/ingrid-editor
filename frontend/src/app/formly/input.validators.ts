import {
  UntypedFormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { isNotEmptyObject } from "../shared/utils";

export const REGEX_URL = "^(https?://)([0-9a-z.-]+)\\.([0-9a-z.]{2,6})(/.*)?";

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
