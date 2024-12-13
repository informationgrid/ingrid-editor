/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
import { map } from "rxjs/operators";
import { of } from "rxjs";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { GeoDatasetDoctype } from "./geo-dataset.doctype";
import { DataOriginViewComponent } from "../components/data-origin-view/data-origin-view.component";

export function dataOrigin(geoDatasetDoctype: GeoDatasetDoctype) {
  return geoDatasetDoctype.addRepeatDetailList(
    "descriptions",
    "Datengrundlage/Herkunft",
    {
      required: false,
      viewComponent: DataOriginViewComponent,
      _types: [
        {
          key: "internalDataOrigin",
          value: "Geodatensatz",
          icon: "Geodatensatz",
        },
        {
          key: "freeDescription",
          value: "Freie Beschreibung",
          icon: "circle",
        },
      ],
      fields: [
        geoDatasetDoctype.addTextAreaInline("value", "Beschreibung", null, {
          required: true,
          wrappers: ["inline-help", "form-field"],
          hasInlineContextHelp: false,
          updateOn: "change",
        }),
        geoDatasetDoctype.addGroupSimple(
          null,
          [
            geoDatasetDoctype.addDatepickerInline("date", null, {
              fieldLabel: "Datum",
              wrappers: ["inline-help", "form-field"],
              expressions: {
                "props.required": (field: FormlyFieldConfig) =>
                  field.form.value._type == "internalDataOrigin" ||
                  !!field.form.value.title ||
                  !!field.form.value.identifier ||
                  !!field.form.value.dateType,
              },
            }),
            geoDatasetDoctype.addSelect("dateType", null, {
              showSearch: true,
              fieldLabel: "Typ",
              wrappers: ["form-field"],
              className: "flex-3",
              options: geoDatasetDoctype.getCodelistForSelect("502", "type"),
              codelistId: "502",
              expressions: {
                "props.required": (field: FormlyFieldConfig) =>
                  field.form.value._type == "internalDataOrigin" ||
                  !!field.form.value.title ||
                  !!field.form.value.identifier ||
                  !!field.form.value.date,
              },
            }),
          ],
          {
            fieldGroupClassName: "flex-row gap-12",
          },
        ),
        geoDatasetDoctype.addDocumentCard("uuidRef", {
          required: true,
          docTypeFilter: ["InGridGeoDataset"],
          label: "Geodatensatz auswählen",
          allowRedirectToDocument: false,
          allowMultiSelect: false,
          titleOfDocumentSelectorDialog: "Geodatensatz auswählen",
          expressions: {
            hide: (field: FormlyFieldConfig) => {
              return field.form.value._type != "internalDataOrigin";
            },
          },
        }),
        geoDatasetDoctype.addInputInline("title", "Titel", {
          wrappers: ["inline-help", "form-field"],
          hasInlineContextHelp: true,
          updateOn: "change",
          expressions: {
            hide: (field: FormlyFieldConfig) => {
              return field.form.value._type == "internalDataOrigin";
            },
            "props.required": (field: FormlyFieldConfig) =>
              !!field.form.value.identifier ||
              !!field.form.value.date ||
              !!field.form.value.dateType,
          },
        }),
        geoDatasetDoctype.addInputInline("identifier", "Identifikator", {
          wrappers: ["inline-help", "form-field"],
          hasInlineContextHelp: true,
          updateOn: "change",
          validators: {
            validation: ["url"],
          },
          expressions: {
            hide: (field: FormlyFieldConfig) => {
              return field.form.value._type == "internalDataOrigin";
            },
            "props.required": (field: FormlyFieldConfig) =>
              !!field.form.value.title ||
              !!field.form.value.date ||
              !!field.form.value.dateType,
          },
        }),
      ],
    },
  );
}
