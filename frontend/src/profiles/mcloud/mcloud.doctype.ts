import {FormlyFieldConfig} from '@ngx-formly/core';
import {DocumentService} from '../../app/services/document/document.service';
import {CodelistService} from '../../app/services/codelist/codelist.service';
import {BaseDoctype} from '../base.doctype';
import {CodelistQuery} from '../../app/store/codelist/codelist.query';
import {Injectable} from '@angular/core';
import {ContextHelpQuery} from '../../app/store/context-help/context-help.query';

// TODO: check out this, for handling functions in json schema: https://stackblitz.com/edit/angular-g1h2be-hpwffy
@Injectable({
  providedIn: 'root'
})
export class McloudDoctype extends BaseDoctype {
  // must be same as DBClass!?
  id = 'mCloudDoc';

  label = 'mCLOUD';

  iconClass = 'Fachaufgabe';

  documentFields = (help: string[]) => <FormlyFieldConfig[]>[
    {
      wrappers: ['section'],
      templateOptions: {
        label: 'Allgemeines'
      },
      fieldGroup: [{
        key: 'description',
        type: 'textarea',
        className: 'description',
        wrappers: ['panel', 'form-field'],
        templateOptions: {
          externalLabel: 'Beschreibung',
          hasContextHelp: help.indexOf('description') > -1,
          autosize: true,
          autosizeMinRows: 3,
          autosizeMaxRows: 8,
          appearance: 'outline',
          required: true
        },
        validators: {
          /*requiredMe: {
            expression: (c) => {
              // debugger;
              return c.root.publish && c.value && c.value.trim().length > 0;
              // return !c.root.publish || (c.root.publish && c.value && c.value.trim().length > 0);
            },
            message: (error, field: FormlyFieldConfig) => `This field is required`,
          }*/
        }
      }, {
        key: 'addresses',
        type: 'ngx-table',
        wrappers: ['panel'],
        templateOptions: {
          externalLabel: 'Adressen',
          columns: [
            {label: 'Name', key: 'name'},
            {
              label: 'Geschlecht', key: 'gender', type: 'select', options: [
                {label: 'Male', value: 'm'},
                {label: 'Female', value: 'f'}
              ]
            },
            {label: 'Start', key: 'start', type: 'date'}
          ]
        }
      }]
    }, {
      wrappers: ['section'],
      templateOptions: {
        label: 'mCLOUD'
      },
      fieldGroup: [{
        key: 'usage',
        type: 'textarea',
        wrappers: ['panel', 'form-field'],
        templateOptions: {
          externalLabel: 'Nutzungshinweise',
          rows: 3,
          appearance: 'outline'
        }
      }, {
        fieldGroupClassName: 'display-flex',
        wrappers: ['panel'],
        templateOptions: {
          externalLabel: 'Kategorien'
        },
        fieldGroup: [{
          key: 'mCloudCategories',
          type: 'select',
          className: 'flex-1',
          wrappers: ['form-field'],
          templateOptions: {
            label: 'mCLOUD Kategorie',
            placeholder: 'Bitte wählen',
            appearance: 'outline',
            options: this.getCodelistForSelect(8000)
            /*options: [
              {label: 'male', value: 'm'},
              {label: 'female', value: 'f'}
            ]*/
          }
        }, {
          key: 'openDataCategories',
          type: 'select',
          className: 'flex-1',
          wrappers: ['form-field'],
          templateOptions: {
            label: 'OpenData Kategorie',
            placeholder: 'Bitte wählen',
            appearance: 'outline',
            options: this.getCodelistForSelect(100)
          }
        }]
      }, {
        key: 'downloads',
        type: 'input',
        wrappers: ['panel', 'form-field'],
        templateOptions: {
          externalLabel: 'Downloads',
          appearance: 'outline',
          click: () => {
            console.log('downloads clicked');
          }
        }
      }, {
        key: 'license',
        type: 'select',
        wrappers: ['panel', 'form-field'],
        templateOptions: {
          externalLabel: 'Lizenz',
          placeholder: 'Bitte wählen',
          appearance: 'outline',
          options: this.getCodelistForSelect(6500)
        }
      }, {
        key: 'origin',
        type: 'textarea',
        wrappers: ['panel', 'form-field'],
        templateOptions: {
          externalLabel: 'Quellenvermerk',
          rows: 3,
          appearance: 'outline'
        }
      }, {
        fieldGroupClassName: 'display-flex',
        wrappers: ['panel'],
        templateOptions: {
          externalLabel: 'mFUND'
        },
        fieldGroup: [{
          key: 'mfundProject',
          type: 'input',
          className: 'flex-1',
          wrappers: ['form-field'],
          templateOptions: {
            label: 'mFUND Projekt',
            appearance: 'outline'
          }
        }, {
          key: 'mfundFKZ',
          type: 'input',
          className: 'flex-1',
          wrappers: ['form-field'],
          templateOptions: {
            label: 'mFUND Förderkennzeichen',
            appearance: 'outline'
          }
        }]
      }]
    }, {
      wrappers: ['section'],
      templateOptions: {
        label: 'Raumbezüge'
      },
      fieldGroup: [{
        key: 'geoReferenceVisual',
        type: 'leaflet',
        wrappers: ['panel'],
        templateOptions: {
          externalLabel: 'Raumbezug',
          mapOptions: {},
          height: 300
        }
      }]
    }, {
      wrappers: ['section'],
      templateOptions: {
        label: 'Zeitbezüge'
      },
      fieldGroup: [
        {
          key: 'temporalReference',
          type: 'input',
          wrappers: ['panel', 'form-field'],
          templateOptions: {
            externalLabel: 'Zeitbezug',
            appearance: 'outline'
          }
        }, {
          fieldGroupClassName: 'display-flex',
          wrappers: ['panel'],
          templateOptions: {
            externalLabel: 'Zeitspanne'
          },
          fieldGroup: [{
            key: 'rangeType',
            type: 'select',
            className: 'flex-1 smallField',
            wrappers: ['form-field'],
            templateOptions: {
              // label: 'Zeitspanne',
              placeholder: 'wählen',
              appearance: 'outline',
              options: [
                {label: 'am', value: 'at'},
                {label: 'seit', value: 'since'},
                {label: 'von - bis', value: 'range'}
              ]
            }
          }, {
            key: 'rangeFrom',
            type: 'datepicker',
            className: 'flex-1',
            wrappers: ['form-field'],
            templateOptions: {
              label: 'am / von',
              appearance: 'outline'
            }
          }, {
            key: 'rangeTo',
            type: 'datepicker',
            className: 'flex-1',
            wrappers: ['form-field'],
            templateOptions: {
              label: 'bis',
              appearance: 'outline'
            },
            hideExpression: (model: any, formState: any, field: FormlyFieldConfig) => {
              // access to the main model can be through `this.model` or `formState` or `model\n' +
              if (model && model.rangeType) {
                return model.rangeType !== 'range';
              }
              return true;
            }
          }]
        }
      ]
    }
  ];

  constructor(codelistService: CodelistService,
              private help: ContextHelpQuery,
              codelistQuery?: CodelistQuery) {

    super(codelistService, codelistQuery);

  }

  init(help: string[]) {

    this.fields.push(...this.documentFields(help));
    console.log('Profile mCLOUD initialized');

  }

}
