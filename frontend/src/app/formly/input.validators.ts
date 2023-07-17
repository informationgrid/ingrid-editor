import {
  UntypedFormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
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
  control: UntypedFormControl
): ValidationErrors {
  const value: any[] = control.value;
  const result = value.every((item) => isNotEmptyObject(item));
  return result
    ? null
    : { hasEmptyRows: { message: "Es dürfen keine leeren Zeilen vorkommen" } };
}

export function UrlValidator(control: UntypedFormControl): ValidationErrors {
  const regExp = new RegExp(REGEX_URL);
  return (!control.value || control.value?.trim().length === 0 || regExp.test(control.value?.trim())) ? null : { url: true };
}

export function UrlValidatorMessage(
  error: any = null,
  field: FormlyFieldConfig = null
) {
  return "Verwenden Sie bitte eine gültige URL";
}

export function LowercaseValidator(
  control: UntypedFormControl
): ValidationErrors {
  return control.value === control.value?.toLowerCase()
    ? null
    : { lowercase: true };
}

export function minValidationMessage(error: any, field: FormlyFieldConfig) {
  return `Der Wert darf nicht kleiner sein als ${field.props.min}`;
}

export function maxValidationMessage(error: any, field: FormlyFieldConfig) {
  return `Der Wert darf nicht größer sein als ${field.props.max}`;
}

export function patternWithMessage(
  pattern: string | RegExp,
  errorField: string,
  message?: string
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
