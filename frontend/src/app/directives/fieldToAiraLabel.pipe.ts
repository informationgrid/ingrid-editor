import { Pipe, PipeTransform } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";

@Pipe({
  name: "fieldToAriaLabel",
})
export class FieldToAriaLabelPipe implements PipeTransform {
  constructor() {}

  transform(field: FormlyFieldConfig): string {
    return fieldToAriaLabel(field);
  }
}

export function fieldToAriaLabel(field: FormlyFieldConfig): string {
  if (field.props.label && field.props.label.trim().length > 0) {
    return field.props.label;
  } else {
    return field.props.fieldLabel;
  }
}
