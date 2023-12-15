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
  name: "fieldToAriaLabelledBy",
  standalone: true,
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
