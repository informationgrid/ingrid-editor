import { UntypedFormControl, ValidationErrors } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";

export function IpValidator(control: UntypedFormControl): ValidationErrors {
  return /(\d{1,3}\.){3}\d{1,3}/.test(control.value?.trim())
    ? null
    : { ip: true };
}

export function EmailValidator(control: UntypedFormControl): ValidationErrors {
  return /^.+@.+\.\w+$/.test(control.value?.trim()) ? null : { email: true };
}

export function UrlValidator(control: UntypedFormControl): ValidationErrors {
  const regExp = new RegExp("(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})(/.*)?");
  return regExp.test(control.value?.trim()) ? null : { url: true };
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
