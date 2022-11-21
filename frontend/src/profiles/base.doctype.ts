import { FormlyFieldConfig } from "@ngx-formly/core";
import { AddressType, Doctype } from "../app/services/formular/doctype";
import { Observable } from "rxjs";
import {
  CodelistService,
  SelectOption,
  SelectOptionUi,
} from "../app/services/codelist/codelist.service";
import { filter, map, take, tap } from "rxjs/operators";
import { CodelistQuery } from "../app/store/codelist/codelist.query";
import { FormFieldHelper } from "./form-field-helper";

export abstract class BaseDoctype extends FormFieldHelper implements Doctype {
  fields = <FormlyFieldConfig[]>[
    {
      key: "title",
      templateOptions: {
        label: "Titel",
      },
    },
    {
      key: "_id",
    },
    {
      key: "_uuid",
    },
    {
      key: "_parent",
    },
    {
      key: "_type",
      templateOptions: {
        label: "Typ",
      },
    },
    {
      key: "_created",
    },
    {
      key: "_createdBy",
    },
    {
      key: "_modified",
      templateOptions: {
        label: "Aktualität",
      },
    },
    {
      key: "_modifiedBy",
    },
    {
      key: "_version",
    },
  ];

  id: string;

  label: string;

  helpIds: string[];

  hasOptionalFields: boolean;

  addressType: AddressType;

  fieldsMap: SelectOptionUi[] = [];
  fieldWithCodelistMap: Map<string, string> = new Map<string, string>();
  fieldsForPrint: FormlyFieldConfig[];

  constructor(
    private codelistService?: CodelistService,
    protected codelistQuery?: CodelistQuery
  ) {
    super();
  }

  abstract documentFields(): FormlyFieldConfig[];

  getFields(): FormlyFieldConfig[] {
    return this.fields;
  }

  getCodelistForSelectWithEmtpyOption(
    codelistId: number,
    field: string
  ): Observable<SelectOptionUi[]> {
    return this.getCodelistForSelect(codelistId, field).pipe(
      map((cl) => [new SelectOption(undefined, "")].concat(cl))
    );
  }

  getCodelistForSelect(
    codelistId: number,
    field: string
  ): Observable<SelectOptionUi[]> {
    if (field) this.fieldWithCodelistMap.set(field, codelistId + "");

    return this.codelistService.observe(codelistId + "");
  }

  init(help: string[]) {
    this.helpIds = help;
    return this.isInitialized().then(() => {
      this.fields.push(...this.documentFields());
      this.hasOptionalFields = this.hasOptionals(this.fields);
      this.addCodelistDefaultValues(this.fields);
      this.addContextHelp(this.fields);
      this.getFieldMap(this.fields);
      const copy: FormlyFieldConfig[] = JSON.parse(JSON.stringify(this.fields));
      this.fieldsForPrint = this.createFieldsForPrint(copy);
      console.debug(`Document type ${this.id} initialized`);
    });
  }

  isInitialized() {
    return Promise.resolve();
  }

  private hasOptionals(fields: FormlyFieldConfig[]): boolean {
    return fields.some((field) => {
      if (field.className && field.className.indexOf("optional") !== -1)
        return true;
      if (field.fieldGroup) {
        if (this.hasOptionals(field.fieldGroup)) return true;
      }
    });
  }

  private addContextHelp(fields: FormlyFieldConfig[]) {
    fields.forEach((field) => {
      let fieldKey = <string>field.key;
      if (field.fieldGroup) {
        this.addContextHelp(field.fieldGroup);
      }
      if ((<FormlyFieldConfig>field.fieldArray)?.fieldGroup) {
        this.addContextHelp((<FormlyFieldConfig>field.fieldArray).fieldGroup);
      }
      if (this.helpIds.indexOf(fieldKey) > -1) {
        if (!field.model?._type) field.templateOptions.docType = this.id;

        if (field.type === "checkbox") {
          field.templateOptions.hasInlineContextHelp = true;
        } else if (!field.templateOptions.hasInlineContextHelp) {
          field.templateOptions.hasContextHelp = true;
        }
      } else if (
        field.templateOptions?.contextHelpId &&
        this.helpIds.indexOf(field.templateOptions.contextHelpId)
      ) {
        field.templateOptions.hasContextHelp = true;
      }
    });
  }

  private getFieldMap(fields: FormlyFieldConfig[]) {
    fields.forEach((field) => {
      let fieldKey = <string>field.key;
      if (field.fieldGroup) {
        this.getFieldMap(field.fieldGroup);
      }

      if (fieldKey) {
        this.fieldsMap.push(
          new SelectOption(
            fieldKey,
            field.templateOptions?.externalLabel || field.templateOptions?.label
          )
        );
      }
    });
  }

  private addCodelistDefaultValues(fields: FormlyFieldConfig[]) {
    fields.forEach((field) => {
      if (field.fieldGroup) {
        this.addCodelistDefaultValues(field.fieldGroup);
      }
      let codelistField = this.fieldWithCodelistMap.get(field.key as string);
      if (codelistField !== undefined) {
        this.codelistQuery
          .selectEntity(codelistField)
          .pipe(
            filter((codelist) => codelist !== undefined),
            take(1),
            filter((codelist) => codelist.default && codelist.default != "-1"),
            tap((codelist) => {
              console.log(
                `Setting default codelist value for: ${field.key} with: ${codelist.default}`
              );
              if (field.type === "select") {
                field.defaultValue = codelist.default;
              } else if (field.type === "repeatList") {
                field.defaultValue = [{ key: codelist.default }];
              } else {
                field.defaultValue = codelist.entries.find(
                  (entry) => entry.id === codelist.default
                ).fields["de"]; // FIXME: choose dynamic correct value or use codelist (needs changing of component)
              }
            })
          )
          .subscribe();
      }
    });
  }

  formatCodelistValue(codelist: string, item: { key; value }) {
    return item?.key
      ? this.codelistQuery.getCodelistEntryValueByKey(
          codelist,
          item.key,
          item.value
        )
      : item?.value;
  }

  private createFieldsForPrint(
    fields: FormlyFieldConfig[]
  ): FormlyFieldConfig[] {
    const supportedTypes = [
      "textarea",
      "address-card",
      "select",
      "autocomplete",
      // "datepicker",
      "repeatList",
      // "table",
    ];
    fields.forEach((field) => {
      if (field.fieldGroup) {
        this.createFieldsForPrint(field.fieldGroup);
      }
      if (field.fieldArray) {
        this.createFieldsForPrint(
          (<FormlyFieldConfig>field.fieldArray).fieldGroup
        );
      }
      if (field.templateOptions?.columns?.length > 0) {
        const formatter = this.getFormatterForColumn(
          this.fields,
          field.key as string
        );
        if (formatter) {
          field.templateOptions.columns.forEach(
            (column, index) =>
              (column.templateOptions.formatter = formatter[index])
          );
        }
      }

      delete field.validators;
      delete field.validation;

      field.wrappers = field.wrappers?.filter(
        (wrapper) => wrapper !== "form-field"
      );

      if (
        field.type &&
        supportedTypes.includes((<FormlyFieldConfig>field).type as string)
      ) {
        field.type += "Print";
      }
    });
    return fields;
  }

  private getFormatterForColumn(
    fields: FormlyFieldConfig[],
    tableId: string
  ): any[] {
    for (const field of fields) {
      if (field.fieldGroup) {
        const result = this.getFormatterForColumn(field.fieldGroup, tableId);
        if (result) return result;
      }
      if (field.fieldArray) {
        const result = this.getFormatterForColumn(
          (<FormlyFieldConfig>field.fieldArray).fieldGroup,
          tableId
        );
        if (result) return result;
      }
      if (field.key === tableId) {
        return field.templateOptions.columns.map(
          (column) => column.templateOptions.formatter
        );
      }
    }
    return null;
  }
}
