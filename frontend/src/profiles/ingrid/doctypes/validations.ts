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
