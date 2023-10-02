import { Pipe, PipeTransform } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";

@Pipe({
  name: "fieldToAriaLabelledBy",
})
export class FieldToAiraLabelledbyPipe implements PipeTransform {
  constructor() {}

  transform(field: FormlyFieldConfig): string {
    return toAriaLabelledBy(field);
  }
}

export function toAriaLabelledBy(field: FormlyFieldConfig): string {
  // if label is already provided, angular material associates label to field automatically.
  if (field.props.label) return undefined;
  // if field has parent label on the left side of the form constructed by "panel", use parent id instead.
  if (field?.parent?.wrappers.includes("panel")) {
    return field.parent.id;
  } else {
    return field?.id ?? "";
  }
}
