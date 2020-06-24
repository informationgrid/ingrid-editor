import {FormlyFieldConfig} from '@ngx-formly/core';
import {DocumentService} from '../../app/services/document/document.service';
import {CodelistService} from '../../app/services/codelist/codelist.service';
import {BaseDoctype} from '../base.doctype';
import {CodelistQuery} from '../../app/store/codelist/codelist.query';
import {Injectable} from '@angular/core';

// TODO: check out this, for handling functions in json schema: https://stackblitz.com/edit/angular-g1h2be-hpwffy
@Injectable({
  providedIn: 'root'
})
export class TestDoctype extends BaseDoctype {
  // must be same as DBClass!?
  id = 'TestDoc';

  label = 'Test-Document';

  iconClass = 'Geodatendienst';

  documentFields = () => <FormlyFieldConfig[]>[
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
      }, {
        key: 'checkbox',
        type: 'checkbox',
        className: 'flex-1',
        wrappers: ['panel', 'form-field', 'inline-help'],
        templateOptions: {
          externalLabel: 'Checkbox',
          label: 'Open Data',
          hasInlineContextHelp: this.hasHelp('checkbox'),
          indeterminate: false,
          required: true
        }
      }]
    }, {
      wrappers: ['section'],
      templateOptions: {
        label: 'Repeatables'
      },
      fieldGroup: [{
        key: 'multiInputs',
        type: 'repeat',
        wrappers: ['panel'],
        templateOptions: {
          externalLabel: 'Multi-Repeat',
          required: true,
          minLength: 1
        },
        fieldArray: {
          fieldGroupClassName: 'display-flex',
          fieldGroup: [
            {
              key: 'date',
              type: 'datepicker',
              className: 'flex-1',
              templateOptions: {
                label: 'Datum',
                appearance: 'outline',
                required: true
              }
            },
            {
              key: 'text',
              type: 'input',
              className: 'flex-1',
              templateOptions: {
                label: 'Typ',
                appearance: 'outline',
                required: true
              }
            }]
        }
      }, {
        key: 'table',
        type: 'table',
        templateOptions: {
          externalLabel: 'Table',
          required: true,
          columns: [{
            key: 'col1',
            type: 'input',
            label: 'Spalte 1',
            templateOptions: {
              label: 'Spalte 1',
              appearance: 'outline'
            }
          }, {
            key: 'col2',
            type: 'input',
            label: 'Spalte 2',
            templateOptions: {
              label: 'Spalte 2',
              appearance: 'outline'
            }
          }, {
            key: 'col3',
            type: 'input',
            label: 'Spalte 3',
            templateOptions: {
              label: 'Spalte 3',
              appearance: 'outline'
            }
          }]
        }
      }, {
        key: 'repeatList',
        type: 'repeatList',
        wrappers: ['panel'],
        templateOptions: {
          externalLabel: 'Repeatable List',
          placeholder: 'Raumbezugssystem wählen...',
          options: this.getCodelistForSelect(100)
        }
      }]
    }, {
      wrappers: ['section'],
      templateOptions: {
        label: 'Raumbezüge'
      },
      fieldGroup: [{
        key: 'map',
        type: 'leaflet',
        wrappers: [],
        templateOptions: {
          mapOptions: {},
          height: 386,
          required: true
        }
      }]
    }
  ];

  constructor(storageService ?: DocumentService, codelistService ?: CodelistService, codelistQuery ?: CodelistQuery) {

    super(codelistService, codelistQuery);

  }

}
