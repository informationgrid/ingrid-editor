import {FormlyFieldConfig} from '@ngx-formly/core';
import {Profile} from '../app/services/formular/profile';

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

  constructor() {
  }

  getFields(): FormlyFieldConfig[] {
    return this.fields;
  }

}
