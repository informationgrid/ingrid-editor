/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
import { FormControl } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";

export function validateDateResourceOrder(
  ctrl: FormControl,
  _: FormlyFieldConfig,
) {
  const event = ctrl.value;
  if (!event) return true;

  const toTime = (d: any) => (d ? new Date(d).setHours(0, 0, 0, 0) : null);
  const created = toTime(event.created);
  const firstPublished = toTime(event.firstPublished);
  const lastModified = toTime(event.lastModified);

  if (created) {
    if (firstPublished && created > firstPublished) return false;
    if (lastModified && created > lastModified) return false;
  }

  return true;
}
