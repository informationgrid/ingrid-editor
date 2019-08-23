import {FormlyFieldConfig} from '@ngx-formly/core';
import {Profile} from '../../services/formular/profile';
import {DocumentService} from '../../services/document/document.service';
import {CodelistService} from '../../services/codelist/codelist.service';
import {from} from 'rxjs';

// TODO: check out this, for handling functions in json schema: https://stackblitz.com/edit/angular-g1h2be-hpwffy
export class McloudFormly implements Profile {
  // must be same as DBClass!?
  id = 'mCloudDoc';

  label = 'mCLOUD';

  treeIconClass = 'fa fa-address-card-o';

  fields = <FormlyFieldConfig[]>[
    {
      key: 'description',
      type: 'textarea',
      wrappers: ['panel', 'form-field'],
      templateOptions: {
        externalLabel: 'Beschreibung',
        rows: 3,
        appearance: 'outline'
      }
    }, {
      key: 'addresses',
      type: 'table',
      wrappers: ['panel'],
      templateOptions: {
        externalLabel: 'Adressen',
        columns: [
          { key: 'name', editable: true, label: 'Name' },
          { key: 'weight', editable: false, label: 'Gewicht' }
        ]
      }
    }, {
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
        appearance: 'outline'
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
    }, {
      key: 'geoReference',
      type: 'input',
      wrappers: ['panel', 'form-field'],
      templateOptions: {
        externalLabel: 'Raumbezug',
        appearance: 'outline'
      }
    }, {
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
          label: 'von',
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
        }
      }]
    }
  ];

  constructor(storageService?: DocumentService, private codelistService?: CodelistService) {

  }

  private getCodelistForSelect(codelistId: number) {

    let codelist = this.codelistService.byId(codelistId+'')
      .then(codelist => {
        console.log("codelist:", codelist);
        return codelist.map( cl => {
          return { label: cl.value, value: cl.id }
        });
      });
    return from(codelist);
  }
}
