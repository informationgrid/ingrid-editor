import { FormControl, ValidationErrors } from "@angular/forms";

export function IpValidator(control: FormControl): ValidationErrors {
  return /(\d{1,3}\.){3}\d{1,3}/.test(control.value?.trim())
    ? null
    : { ip: true };
}

export function EmailValidator(control: FormControl): ValidationErrors {
  console.log(".");
  return /^.+@.+\.\w+$/.test(control.value?.trim()) ? null : { email: true };
}

export function EmailInRepeatValidator(control: FormControl): ValidationErrors {
  const connectionType = control.parent.value.type;
  // if connection type is email
  if (connectionType?.key === "3") {
    return EmailValidator(control);
  }
}

export function LowercaseValidator(control: FormControl): ValidationErrors {
  return control.value === control.value?.toLowerCase()
    ? null
    : { lowercase: true };
}
