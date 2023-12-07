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
