import {FormlyFieldConfig} from '@ngx-formly/core';
import {Profile} from '../app/services/formular/profile';

export abstract class BaseProfile implements Profile {

  fields = <FormlyFieldConfig[]>[
    {
      key: 'title',
      type: 'input',
      hide: true
    },
    {
      key: '_id',
      type: 'input',
      hide: true
    },
    {
      key: '_parent',
      type: 'input',
      hide: true
    },
    {
      key: '_profile',
      type: 'input',
      hide: true
    }
  ];

  constructor() {
  }

  id: string;
  label: string;

  getFields(): FormlyFieldConfig[] {
    return [];
  }


}
