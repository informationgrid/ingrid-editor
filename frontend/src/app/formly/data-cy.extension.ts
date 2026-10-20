/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { FormlyExtension, FormlyFieldConfig } from "@ngx-formly/core";

/**
 * Stable E2E hooks (`data-cy`) for Formly fields.
 *
 * Container-level hooks already exist and stay untouched:
 * - one-column wrapper ("panel"): `props.contextHelpId ?? key ?? props.externalLabel`
 * - repeat: `repeat-<key>`, `btn-add`/`btn-remove` and per-child `formly-field[data-cy=<key>]`
 * - table: `<key>`, `<key>-header`, `<key>-table`
 * - metadata: `<key>`
 *
 * Field types with direct input interaction that provide no hook of their own
 * get one on their interactive element (input/textarea/select/...), applied via
 * the `formlyAttributes` directive (`props.attributes`). The value follows the
 * one-column fallback chain, prefixed with the field type so it can never
 * collide with a container hook of the same field:
 *
 *   data-cy="<prefix>-<contextHelpId ?? key ?? externalLabel>"
 *
 * Existing hooks (e.g. `input-<key>` set by `FormFieldHelper.addInput`) are
 * never overwritten. Types providing their own template hooks (`ige-select`
 * → `select-<key>`, `autocomplete` → `autocomplete-<key>`) are not listed.
 */
const DATA_CY_TYPE_PREFIXES: Record<string, string> = {
  input: "input",
  number: "input",
  integer: "input",
  string: "input",
  textarea: "textarea",
  select: "select",
  "native-select": "native-select",
  datepicker: "datepicker",
  timepicker: "timepicker",
  checkbox: "checkbox",
  toggle: "toggle",
  radio: "radio",
  multicheckbox: "multicheckbox",
};

/**
 * Derives the hook value using the same fallback chain as the one-column
 * wrapper. Array keys are reduced to their last segment (the field's own
 * name); scoping to a unique element is done by parent containers in the
 * test selectors.
 */
export function dataCyValue(field: FormlyFieldConfig): string | null {
  const props = <any>field.props ?? {};
  const key = field.key;
  const keyValue =
    key == null || key === ""
      ? null
      : Array.isArray(key)
        ? String(key[key.length - 1])
        : String(key);
  const value = props.contextHelpId ?? keyValue ?? props.externalLabel;
  return value == null || value === "" ? null : String(value);
}

export const dataCyExtension: FormlyExtension = {
  prePopulate(field: FormlyFieldConfig) {
    // types registered by component reference provide their own hooks
    if (typeof field.type !== "string") {
      return;
    }
    const prefix = DATA_CY_TYPE_PREFIXES[field.type];
    if (!prefix) {
      return;
    }
    const value = dataCyValue(field);
    if (!value) {
      return;
    }
    // props may be undefined (e.g. hidden internal fields like the repeat
    // detail dialog's "_type" input declare no props/templateOptions)
    if (!field.props) {
      return;
    }
    // never override an existing hook (e.g. "input-<key>" from addInput)
    if (field.props.attributes?.["data-cy"] != null) {
      return;
    }
    // copy instead of mutate in case the attributes object is shared
    field.props.attributes = {
      ...field.props.attributes,
      "data-cy": `${prefix}-${value}`,
    };
  },
};
