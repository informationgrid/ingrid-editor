import {FormlyFieldConfig} from '@ngx-formly/core';
import {CodelistService} from '../../app/services/codelist/codelist.service';
import {BaseDoctype} from '../base.doctype';
import {CodelistQuery} from '../../app/store/codelist/codelist.query';
import {Injectable} from '@angular/core';

// TODO: check out this, for handling functions in json schema: https://stackblitz.com/edit/angular-g1h2be-hpwffy
@Injectable({
  providedIn: 'root'
})
export class McloudDoctype extends BaseDoctype {

  // must be same as DBClass
  id = 'mCloudDoc';

  label = 'mCLOUD';

  iconClass = 'Fachaufgabe';

  documentFields = () => <FormlyFieldConfig[]>[
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
          hasContextHelp: this.hasHelp('description'),
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
        type: 'address-card',
        wrappers: ['panel'],
        templateOptions: {
          externalLabel: 'Adressen',
          hasContextHelp: this.hasHelp('addresses')
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
          hasContextHelp: this.hasHelp('usage'),
          rows: 3,
          appearance: 'outline'
        }
      }, {
        fieldGroupClassName: 'display-flex',
        wrappers: ['panel'],
        templateOptions: {
          externalLabel: 'Kategorien',
          hasContextHelp: this.hasHelp('categories')
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
          hasContextHelp: this.hasHelp('downloads'),
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
          hasContextHelp: this.hasHelp('license'),
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
          hasContextHelp: this.hasHelp('origin'),
          rows: 3,
          appearance: 'outline'
        }
      }, {
        fieldGroupClassName: 'display-flex',
        wrappers: ['panel'],
        templateOptions: {
          externalLabel: 'mFUND',
          hasContextHelp: this.hasHelp('mfund')
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
          hasContextHelp: this.hasHelp('geoReference'),
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
            hasContextHelp: this.hasHelp('temporalReference'),
            appearance: 'outline'
          }
        }, {
          fieldGroupClassName: 'display-flex',
          wrappers: ['panel'],
          templateOptions: {
            externalLabel: 'Zeitspanne',
            hasContextHelp: this.hasHelp('dateRange')
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
              codelistQuery?: CodelistQuery) {

    super(codelistService, codelistQuery);

  }

  init(help: string[]) {

    this.helpIds = help;
    this.fields.push(...this.documentFields());
    console.log('Profile mCLOUD initialized');

  }

}
