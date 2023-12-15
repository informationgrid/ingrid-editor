/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { Pipe, PipeTransform } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";

@Pipe({
  name: "fieldToAriaLabel",
  standalone: true,
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
