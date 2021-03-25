import {FormlyFieldConfig} from '@ngx-formly/core';
import {Doctype} from '../app/services/formular/doctype';
import {Observable} from 'rxjs';
import {CodelistService, SelectOption} from '../app/services/codelist/codelist.service';
import {map} from 'rxjs/operators';
import {CodelistQuery} from '../app/store/codelist/codelist.query';

export abstract class BaseDoctype implements Doctype {

  fields = <FormlyFieldConfig[]>[
    {
      key: 'title',
      templateOptions: {
        label: 'Titel'
      }
    },
    {
      key: '_id'
    },
    {
      key: '_parent'
    },
    {
      key: '_type',
      templateOptions: {
        label: 'Typ'
      }
    },
    {
      key: '_created'
    },
    {
      key: '_modified',
      templateOptions: {
        label: 'Aktualität'
      }
    },
    {
      key: '_version'
    }
  ];

  id: string;

  label: string;

  helpIds: string[];

  hasOptionalFields: boolean;

  fieldsMap: SelectOption[] = [];

  constructor(private codelistService: CodelistService,
              private codelistQuery: CodelistQuery) {
  }

  abstract documentFields(): FormlyFieldConfig[];

  getFields(): FormlyFieldConfig[] {
    return this.fields;
  }


  getCodelistForSelectWithEmtpyOption(codelistId: number): Observable<SelectOption[]> {
    return this.getCodelistForSelect(codelistId).pipe(map(cl => [{label: '', value: undefined}].concat(cl)))
  }


  getCodelistForSelect(codelistId: number): Observable<SelectOption[]> {

    this.codelistService.byId(codelistId + '');

    return this.codelistQuery.selectEntity(codelistId)
      .pipe(
        map(CodelistService.mapToSelectSorted)
      );

  }

  init(help: string[]) {
    this.helpIds = help;
    this.fields.push(...this.documentFields());
    this.hasOptionalFields = this.hasOptionals(this.fields);
    this.addContextHelp(this.fields);
    this.getFieldMap(this.fields);
    console.log('Profile initialized');
  }

  private hasOptionals(fields: FormlyFieldConfig[]): boolean {
    return fields.some(field => {
      if (field.className && field.className.indexOf('optional') !== -1) return true;
      if (field.fieldGroup) {
        if (this.hasOptionals(field.fieldGroup)) return true;
      }
    });
  }

  private addContextHelp(fields: FormlyFieldConfig[]) {
    fields.forEach(field => {
      let fieldKey = <string>field.key;
      if (field.fieldGroup) {
        this.addContextHelp(field.fieldGroup);
      }
      if (this.helpIds.indexOf(fieldKey) > -1) {
        if (!field.model?._type) field.templateOptions.docType = this.id;

        if (field.type === 'checkbox') {
          field.templateOptions.hasInlineContextHelp = true;
        } else if (!field.templateOptions.hasInlineContextHelp) {
          field.templateOptions.hasContextHelp = true;
        }
      }
    });
  }

  private getFieldMap(fields: FormlyFieldConfig[]) {
    fields.forEach(field => {
      let fieldKey = <string>field.key;
      if (field.fieldGroup) {
        this.getFieldMap(field.fieldGroup);
      }

      if (fieldKey) {
        this.fieldsMap.push({value: fieldKey, label: field.templateOptions?.externalLabel || field.templateOptions?.label});
      }
    });
  }
}
