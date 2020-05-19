import {FormlyFieldConfig} from '@ngx-formly/core';
import {Profile} from '../app/services/formular/profile';
import {Observable} from 'rxjs';
import {CodelistService, SelectOption} from '../app/services/codelist/codelist.service';
import {map} from 'rxjs/operators';
import {CodelistQuery} from '../app/store/codelist/codelist.query';

export abstract class BaseProfile implements Profile {

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
      key: '_profile'
    },
    {
      key: '_created'
    }
  ];

  id: string;

  label: string;

  constructor(private codelistService: CodelistService,
              private codelistQuery: CodelistQuery) {
  }

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

}
