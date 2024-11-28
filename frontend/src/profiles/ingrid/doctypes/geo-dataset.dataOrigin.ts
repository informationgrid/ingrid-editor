import { map } from "rxjs/operators";
import { of } from "rxjs";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { GeoDatasetDoctype } from "./geo-dataset.doctype";

export function dataOrigin(geoDatasetDoctype: GeoDatasetDoctype) {
  return geoDatasetDoctype.addRepeatDetailList(
    "descriptions",
    "Datengrundlage/Herkunft",
    {
      required: true,
      itemPreviewFields: {
        category: (item) => {
          let value = "";
          if (item["_type"] == "freeDescription") {
            value = "Freie Beschreibung " + (item["identifier"] ?? "");
          } else if (item["_type"] == "internalDataOrigin") {
            value = "Geodatensatz " + item["uuidRef"];
          }
          return of({ value, navigateTo: null });
        },
        title: (item) => {
          if (item["_type"] == "internalDataOrigin") {
            return geoDatasetDoctype.documentService
              .load(item["uuidRef"], false, false, true)
              .pipe(
                map((doc) => {
                  return {
                    value: doc?.document.title,
                    navigateTo: {
                      target: item["uuidRef"],
                      internal: true,
                    },
                  };
                }),
              );
          } else {
            return of({
              value: item["title"],
              navigateTo: { target: item["url"] },
            });
          }
        },
        subtitle: (item) => {
          const codelistKey = item["dateType"]?.["key"] ?? null;
          let value: string = item["date"]
            ? new Date(item["date"]).toLocaleDateString("de-DE")
            : "";
          if (codelistKey != null) {
            geoDatasetDoctype.codelistPipe
              .transform(codelistKey, "502")
              .subscribe((codelist) => {
                value += " - " + codelist;
              });
          }
          return of({
            value,
            navigateTo: null,
          });
        },
        description: (item) => {
          return of({
            value: item["value"],
            navigateTo: null,
          });
        },
      },
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
          hasInlineContextHelp: true,
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
              wrappers: ["inline-help", "form-field"],
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
        // geoDatasetDoctype.addGroupSimple(
        //   null,
        //   [
        //     geoDatasetDoctype.addInputInline(
        //       "url",
        //       "URL Externer Geodatensatz",
        //       {
        //         wrappers: ["inline-help", "form-field"],
        //         className: "flex-3",
        //         hasInlineContextHelp: true,
        //         updateOn: "change",
        //         validators: {
        //           validation: ["url"],
        //         },
        //         expressions: {
        //           hide: (field: FormlyFieldConfig) => {
        //             return field.form.value._type != "freeDescription";
        //           },
        //         },
        //         validation: {
        //           messages: {
        //             required: "URL oder Datensatzverweis muss ausgefüllt sein",
        //           },
        //         },
        //       },
        //     ),
        //   ],
        //   { fieldGroupClassName: "flex-row gap-12" },
        // ),
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
