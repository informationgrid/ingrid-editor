import {FormlyFieldConfig} from '@ngx-formly/core';
import {DocumentService} from '../../app/services/document/document.service';
import {CodelistService} from '../../app/services/codelist/codelist.service';
import {from} from 'rxjs';
import {BaseProfile} from '../base.profile';

// TODO: check out this, for handling functions in json schema: https://stackblitz.com/edit/angular-g1h2be-hpwffy
export class TestProfile extends BaseProfile {
  // must be same as DBClass!?
  id = 'TestDoc';

  label = 'Test-Document';

  iconClass = 'Geodatendienst';

  profileFields = <FormlyFieldConfig[]>[
    {
      wrappers: ['section'],
      templateOptions: {
        label: 'Eingabetypen'
      },
      fieldGroup: [{
        key: 'text',
        type: 'input',
        wrappers: ['panel', 'form-field'],
        templateOptions: {
          externalLabel: 'Textfeld',
          appearance: 'outline',
          required: true
        }
      }, {
        key: 'description',
        type: 'textarea',
        className: 'description',
        wrappers: ['panel', 'form-field'],
        templateOptions: {
          externalLabel: 'Textarea',
          autosize: true,
          autosizeMinRows: 3,
          autosizeMaxRows: 8,
          appearance: 'outline',
          required: true
        }
      }, {
        key: 'select',
        type: 'select',
        className: 'flex-1',
        wrappers: ['panel', 'form-field'],
        templateOptions: {
          externalLabel: 'Selectbox',
          placeholder: 'Bitte wählen',
          appearance: 'outline',
          options: this.getCodelistForSelect(8000),
          required: true
        }
      }]
    }
  ];

  constructor(storageService?: DocumentService, private codelistService?: CodelistService) {
    super();
    this.fields.push(...this.profileFields);
  }

  private getCodelistForSelect(codelistId: number) {

    const codelistPromise = this.codelistService.byId(codelistId + '')
      .then(codelist => {
        return codelist.map(cl => {
          return {label: cl.value, value: cl.id}
        });
      });
    return from(codelistPromise);
  }
}
