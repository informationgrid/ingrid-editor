/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import { FormFieldHelper } from "../../form-field-helper";
import { GeometryContextDialogComponent } from "./geometry-context-dialog.component";

export function geometryContextFields() {
  const fieldHelper = new FormFieldHelper();
  return [
    fieldHelper.addInputInline("geometryType", "Geometrie-Typ", {
      required: true,
    }),
    fieldHelper.addInputInline("name", "Name", {
      required: true,
    }),
    fieldHelper.addSelectInline("featureType", "Feature-Typ", {
      required: true,
      options: GeometryContextDialogComponent.featureTypeOptions,
    }),
    fieldHelper.addInputInline("dataType", "Daten-Typ/-Klasse", {
      required: true,
    }),
    fieldHelper.addInputInline("description", "Beschreibung", {
      required: true,
    }),
    fieldHelper.addGroupSimple(
      null,
      [
        fieldHelper.addInputInline("min", "Min", {
          type: "number",
          className: "flex-1",
        }),
        fieldHelper.addInputInline("max", "Max", {
          type: "number",
          className: "flex-1",
        }),
      ],
      {
        fieldGroupClassName: "flex-row gap-12",
        hideExpression:
          "!model.featureType || model.featureType?.key === 'nominal' || model.featureType?.key === 'other'",
      },
    ),
    fieldHelper.addInputInline("unit", "Einheit", {
      required: true,
      expressions: {
        hide: "model.featureType?.key !== 'scalar'",
      },
    }),
    fieldHelper.addRepeat("attributes", "Attribute", {
      fields: [
        fieldHelper.addInputInline("key", "Code"),
        fieldHelper.addInputInline("value", "Definition"),
      ],
    }),
  ];
}
