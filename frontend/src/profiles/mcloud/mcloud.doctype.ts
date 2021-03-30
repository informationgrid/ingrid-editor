import {FormlyFieldConfig} from '@ngx-formly/core';
import {CodelistService} from '../../app/services/codelist/codelist.service';
import {BaseDoctype} from '../base.doctype';
import {CodelistQuery} from '../../app/store/codelist/codelist.query';
import {Injectable} from '@angular/core';
import {CodelistStore} from '../../app/store/codelist/codelist.store';
import {map} from 'rxjs/operators';

// TODO: check out this, for handling functions in json schema: https://stackblitz.com/edit/angular-g1h2be-hpwffy
@Injectable({
  providedIn: 'root'
})
export class McloudDoctype extends BaseDoctype {

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
          required: true
        },
        validators: {
          needPublisher: {
            expression: ctrl => ctrl.value ? ctrl.value.some(row => row.type === '10') : false,
            message: 'Es muss ein Herausgeber als Adresse angegeben sein'
          }
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
        key: 'mCloudCategories',
        type: 'repeatChip',
        wrappers: ['panel'],
        templateOptions: {
          externalLabel: 'mCLOUD Kategorie',
          placeholder: 'Bitte wählen',
          appearance: 'outline',
          required: true,
          useDialog: true,
          options: this.getCodelistForSelect(20000),
          codelistId: 20000
        }
      }, {
        key: 'openDataCategories',
        type: 'repeatChip',
        wrappers: ['panel'],
        templateOptions: {
          externalLabel: 'OpenData Kategorie',
          placeholder: 'Bitte wählen',
          appearance: 'outline',
          required: true,
          useDialog: true,
          options: this.getCodelistForSelect(20001),
          codelistId: 20001
        }
      }, {
        key: 'downloads',
        type: 'table',
        templateOptions: {
          externalLabel: 'Downloads',
          required: true,
          columns: [{
            key: 'title',
            type: 'input',
            label: 'Titel',
            focus: true,
            class: 'flex-2',
            templateOptions: {
              label: 'Titel',
              appearance: 'outline'
            }
          }, {
            key: 'link',
            type: 'input',
            label: 'Link',
            class: 'flex-2',
            templateOptions: {
              label: 'Link',
              appearance: 'outline',
              required: true,
              formatter: text => `<a href="${text}" target="_blank" class="no-text-transform">${text}</a>`
            }
          }, {
            key: 'type',
            type: 'input',
            label: 'Typ',
            templateOptions: {
              label: 'Typ',
              appearance: 'outline',
              required: true
            }
          }, {
            key: 'format',
            type: 'input',
            label: 'Datenformat',
            templateOptions: {
              label: 'Datenformat',
              appearance: 'outline'
            }
          }]
        }
      }, {
        key: 'license',
        type: 'autocomplete',
        wrappers: ['panel'],
        templateOptions: {
          externalLabel: 'Lizenz',
          placeholder: 'Bitte wählen',
          appearance: 'outline',
          required: true,
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
          wrappers: ['form-field', 'inline-help'],
          templateOptions: {
            label: 'mFUND Projekt',
            hasInlineContextHelp: true,
            appearance: 'outline'
          }
        }, {
          key: 'mfundFKZ',
          type: 'input',
          className: 'flex-1',
          wrappers: ['form-field', 'inline-help'],
          templateOptions: {
            label: 'mFUND Förderkennzeichen',
            hasInlineContextHelp: true,
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
        wrappers: [],
        templateOptions: {
          mapOptions: {},
          externalLabel: 'Raumbezüge',
          height: 386
        }
      }]
    }, {
      wrappers: ['section'],
      templateOptions: {
        label: 'Zeitbezüge'
      },
      fieldGroup: [
        {
          key: 'events',
          type: 'repeat',
          wrappers: ['panel'],
          templateOptions: {
            externalLabel: 'Zeitbezug der Ressource'
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
                type: 'select',
                className: 'flex-1',
                templateOptions: {
                  label: 'Typ',
                  appearance: 'outline',
                  required: true,
                  options: this.getCodelistForSelect(502).pipe(
                    map(items => items.filter(it => it.value !== '2'))
                  )
                }
              }]
          }
        }, {
          fieldGroupClassName: 'display-flex',
          wrappers: ['panel'],
          key: 'timeSpan',
          templateOptions: {
            externalLabel: 'Zeitspanne'
          },
          fieldGroup: [{
            key: 'rangeType',
            type: 'select',
            className: 'flex-1',
            wrappers: ['form-field'],
            templateOptions: {
              placeholder: 'Wählen...',
              appearance: 'outline',
              options: [
                {label: 'am', value: 'at'},
                {label: 'seit', value: 'since'},
                {label: 'bis', value: 'till'},
                {label: 'von - bis', value: 'range'}
              ]
            }
          }, {
            key: 'timeSpanDate',
            type: 'datepicker',
            className: 'flex-1',
            wrappers: ['form-field'],
            templateOptions: {
              placeholder: 'TT.MM.JJJJ',
              appearance: 'outline'
            },
            hideExpression: (model: any) => model && model.rangeType === 'range'
          }, {
            key: 'timeSpanRange',
            type: 'date-range',
            className: 'flex-1',
            wrappers: ['form-field'],
            templateOptions: {
              placeholder: 'Zeitraum eingeben ...',
              appearance: 'outline'
            },
            hideExpression: (model: any) => model && model.rangeType !== 'range'
          }]
        }, {
          key: 'periodicity',
          type: 'select',
          wrappers: ['panel', 'form-field'],
          templateOptions: {
            externalLabel: 'Periodizität',
            appearance: 'outline',
            options: this.getCodelistForSelect(518)
          }
        }
      ]
    }
  ];

  constructor(codelistService: CodelistService,
              codelistStore: CodelistStore,
              codelistQuery?: CodelistQuery) {

    super(codelistService, codelistQuery);

  }

}
