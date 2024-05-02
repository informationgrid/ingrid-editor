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
import { inject } from "@angular/core";

export abstract class BaseDoctype extends FormFieldHelper implements Doctype {
  protected codelistService = inject(CodelistService);
  protected codelistQuery = inject(CodelistQuery);

  manipulateDocumentFields = (fieldConfig: FormlyFieldConfig[]) => {
    return fieldConfig;
  };

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
    },
    {
      key: "_contentModified",
      props: {
        label: "Aktualität",
      },
    },
    {
      key: "_contentModifiedBy",
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
      this.addDatepicker("_contentModified", "Geändert am", {
        className: "flex-1",
      }),
      this.addTextArea("_contentModifiedBy", "Bearbeiter", {
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

  abstract documentFields(): FormlyFieldConfig[];

  getFields(): FormlyFieldConfig[] {
    return this.fields;
  }

  getCodelistForSelectWithEmtpyOption(
    codelistId: string,
    field: string,
  ): Observable<SelectOptionUi[]> {
    return this.getCodelistForSelect(codelistId, field).pipe(
      map((cl) => [new SelectOption(undefined, "")].concat(cl)),
    );
  }

  getCodelistForSelect(
    codelistId: string,
    field: string,
    sort: boolean = true,
  ): Observable<SelectOptionUi[]> {
    if (field) this.fieldWithCodelistMap.set(field, codelistId);

    return this.codelistService.observe(codelistId, sort);
  }

  async init(help: string[]): Promise<void> {
    this.helpIds = help;
    await this.isInitialized();

    this.fields.push(...this.documentFields());
    this.hasOptionalFields = this.hasOptionals(this.fields);
    this.addCodelistDefaultValues(this.fields);
    if (this.helpIds.length > 0) this.addContextHelp(this.fields);
    this.getFieldMap(this.fields);

    this.cleanFields = JSON.parse(
      JSON.stringify(this.fields, this.removeObservables),
    );
    console.debug(`Document type ${this.id} initialized`);
  }

  isInitialized() {
    return Promise.resolve();
  }

  private removeObservables(_: string, value: any) {
    if (value?.subscribe !== undefined) return undefined;
    else return value;
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
            field.props?.externalLabel || field.props?.label,
          ),
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
              console.debug(
                `Setting default codelist value for: ${field.key} with: ${codelist.default}`,
              );
              if (field.type === "ige-select") {
                field.defaultValue = { key: codelist.default };
              } else if (field.type === "repeatList") {
                field.defaultValue = [{ key: codelist.default }];
              } else {
                field.defaultValue = codelist.entries.find(
                  (entry) => entry.id === codelist.default,
                ).fields["de"]; // FIXME: choose dynamic correct value or use codelist (needs changing of component)
              }
            }),
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
          item.value,
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
    fields: FormlyFieldConfig[],
  ): FormlyFieldConfig[] {
    const supportedTypes = [
      "input",
      "textarea",
      "address-card",
      "ige-select",
      "autocomplete",
      "datepicker",
      "repeatList",
      "unit-input",
      // "table",
    ];
    const excludedTypes = ["updateGetCapabilities"];
    fields?.forEach((field) => {
      if (field.fieldGroup) {
        field.fieldGroup = this.createFieldsForPrint(field.fieldGroup);
      }
      if (field.props?.menuOptions) {
        field.props.menuOptions.forEach((option) => {
          option.fields.fieldGroup = this.createFieldsForPrint(
            option.fields.fieldGroup,
          );
        });
      }
      if (field.fieldArray) {
        (<FormlyFieldConfig>field.fieldArray).fieldGroup =
          this.createFieldsForPrint(
            (<FormlyFieldConfig>field.fieldArray).fieldGroup,
          );
      }
      if (field.props?.columns?.length > 0) {
        const formatter = this.getFormatterForColumn(
          this.fields,
          field.key as string,
        );
        if (formatter) {
          field.props.columns.forEach((column, index) => {
            if (formatter[index]) {
              return (column.props.formatter = formatter[index]);
            }
          });
        }
      }

      delete field.validators;
      delete field.validation;

      field.wrappers = field.wrappers?.filter(
        (wrapper) => wrapper !== "form-field",
      );

      if (
        field.type &&
        supportedTypes.includes((<FormlyFieldConfig>field).type as string)
      ) {
        field.type += "Print";
      }
    });
    // TODO: remove excludedTypes and use hideInPreview instead
    return fields
      ?.filter((field) => !excludedTypes.includes(<string>field.type))
      ?.filter((field) => !field.props?.hideInPreview);
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
          diffObj,
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
    tableId: string,
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
          tableId,
        );
        if (result) return result;
      }
      if (field.key === tableId) {
        return field.props.columns.map((column) => column.props?.formatter);
      }
    }
    return null;
  }
}
