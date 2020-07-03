import {FormlyFieldConfig} from '@ngx-formly/core';
import {Doctype} from '../app/services/formular/doctype';
import {Observable} from 'rxjs';
import {CodelistService, SelectOption} from '../app/services/codelist/codelist.service';
import {map} from 'rxjs/operators';
import {CodelistQuery} from '../app/store/codelist/codelist.query';

export abstract class BaseDoctype implements Doctype {

  fields = <FormlyFieldConfig[]>[
    {
      key: 'title'
    },
    {
      key: '_id'
    },
    {
      key: '_parent'
    },
    {
      key: '_type'
    },
    {
      key: '_created'
    },
    {
      key: '_version'
    }
  ];

  id: string;

  label: string;

  helpIds: string[];

  constructor(private codelistService: CodelistService,
              private codelistQuery: CodelistQuery) {
  }

  abstract documentFields(): FormlyFieldConfig[];

  getFields(): FormlyFieldConfig[] {
    return this.fields;
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

    this.addContextHelp(this.fields);
    console.log('Profile initialized');
  }

  private addContextHelp(fields: FormlyFieldConfig[], previousKey?: string) {
    fields.forEach(field => {
      if (field.fieldGroup) {
        this.addContextHelp(field.fieldGroup, field.key);
      }
      if (this.helpIds.indexOf(field.key) > -1) {
        if (field.type === 'checkbox') {
          field.templateOptions.hasInlineContextHelp = true;
        } else {
          field.templateOptions.hasContextHelp = true;
        }
      }
    });
  }
}
