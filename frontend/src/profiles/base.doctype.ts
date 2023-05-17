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
import { clone } from "../app/shared/utils";

export abstract class BaseDoctype extends FormFieldHelper implements Doctype {
  fields = <FormlyFieldConfig[]>[
    {
      key: "title",
      props: {
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
      props: {
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
      props: {
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

  private metaFields: FormlyFieldConfig[] = [
    this.addSection("", [
      this.addTextArea("title", "Titel", {
        className: "width-100",
        wrappers: ["panel", "form-field"],
      }),
      this.addDatepicker("_created", "Erstellt am", {
        className: "flex-1",
      }),
      this.addTextArea("_createdBy", "Ersteller", {
        className: "flex-1",
        wrappers: ["panel", "form-field"],
      }),
      this.addDatepicker("_modified", "Geändert am", {
        className: "flex-1",
      }),
      this.addTextArea("_modifiedBy", "Bearbeiter", {
        className: "flex-1",
        wrappers: ["panel", "form-field"],
      }),
    ]),
  ];

  id: string;

  label: string;

  helpIds: string[];

  hasOptionalFields: boolean;

  addressType: AddressType;

  fieldsMap: SelectOptionUi[] = [];
  fieldWithCodelistMap: Map<string, string> = new Map<string, string>();
  cleanFields: FormlyFieldConfig[];

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
      if (this.helpIds.length > 0) this.addContextHelp(this.fields);
      this.getFieldMap(this.fields);

      this.cleanFields = JSON.parse(JSON.stringify(this.fields));
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
        if (!field.model?._type) field.props.docType = this.id;

        // automatically add inline help info when special wrapper is used
        if (field.wrappers && field.wrappers.indexOf("inline-help") !== -1) {
          field.props.hasInlineContextHelp = true;
        }
        if (!field.props.hasInlineContextHelp) {
          field.props.hasContextHelp = true;
        }
      } else if (
        field.props?.contextHelpId &&
        this.helpIds.indexOf(field.props.contextHelpId)
      ) {
        field.props.hasContextHelp = true;
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
            field.props?.externalLabel || field.props?.label
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

  public getFieldsForPrint(diffObj) {
    const copy: FormlyFieldConfig[] = [
      ...clone(this.metaFields),
      ...clone(this.cleanFields),
    ];
    if (diffObj) this.addDifferenceFlags(copy, diffObj);
    return this.createFieldsForPrint(copy);
  }

  private createFieldsForPrint(
    fields: FormlyFieldConfig[]
  ): FormlyFieldConfig[] {
    const supportedTypes = [
      "input",
      "textarea",
      "address-card",
      "select",
      "autocomplete",
      "datepicker",
      "repeatList",
      // "table",
    ];
    const excludedTypes = ["updateGetCapabilities"];
    fields?.forEach((field) => {
      if (field.fieldGroup) {
        this.createFieldsForPrint(field.fieldGroup);
      }
      if (field.fieldArray) {
        this.createFieldsForPrint(
          (<FormlyFieldConfig>field.fieldArray).fieldGroup
        );
      }
      if (field.props?.columns?.length > 0) {
        const formatter = this.getFormatterForColumn(
          this.fields,
          field.key as string
        );
        if (formatter) {
          field.props.columns.forEach(
            (column, index) => (column.props.formatter = formatter[index])
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
    return fields?.filter(
      (field) => !excludedTypes.includes(<string>field.type)
    );
  }

  private calcIsDifferent(field, diffObj): boolean {
    if (!diffObj) return false;
    const path = this.getKeyPath(field);
    if (!path.length) return false;
    let diff = diffObj;
    for (const key of path) {
      if (key in diff) {
        diff = diff[key];
      } else {
        return false;
      }
    }
    return true;
  }

  addDifferenceFlags(fields: FormlyFieldConfig[], diffObj) {
    fields?.forEach((field) => {
      if (field.fieldGroup) {
        this.addDifferenceFlags(field.fieldGroup, diffObj);
      }
      if (field.fieldArray) {
        this.addDifferenceFlags(
          (<FormlyFieldConfig>field.fieldArray).fieldGroup,
          diffObj
        );
      }
      if (this.calcIsDifferent(field, diffObj)) {
        field.className = field.className
          ? field.className + " mark-different"
          : "mark-different";
      } else {
        field.className = field.className?.replace("mark-different", "");
      }
    });
  }

  getKeyPath(field): string[] {
    if (field.parent) {
      return field.key
        ? this.getKeyPath(field.parent).concat([field.key.toString()])
        : this.getKeyPath(field.parent);
    } else {
      return field.key ? [field.key.toString()] : [];
    }
  }

  private getFormatterForColumn(
    fields: FormlyFieldConfig[],
    tableId: string
  ): any[] {
    if (!fields) return null;
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
        return field.props.columns.map((column) => column.props.formatter);
      }
    }
    return null;
  }
}
