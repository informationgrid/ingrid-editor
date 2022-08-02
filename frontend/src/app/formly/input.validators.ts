import { UntypedFormControl, ValidationErrors } from "@angular/forms";

export function IpValidator(control: UntypedFormControl): ValidationErrors {
  return /(\d{1,3}\.){3}\d{1,3}/.test(control.value?.trim())
    ? null
    : { ip: true };
}

export function EmailValidator(control: UntypedFormControl): ValidationErrors {
  return /^.+@.+\.\w+$/.test(control.value?.trim()) ? null : { email: true };
}

export function EmailInRepeatValidator(
  control: UntypedFormControl
): ValidationErrors {
  const connectionType = control.parent.value.type;
  // if connection type is email
  if (connectionType?.key === "3") {
    return EmailValidator(control);
  }
}

export function LowercaseValidator(
  control: UntypedFormControl
): ValidationErrors {
  return control.value === control.value?.toLowerCase()
    ? null
    : { lowercase: true };
}
