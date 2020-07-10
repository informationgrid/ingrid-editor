import {FormlyFieldConfig} from '@ngx-formly/core';
import {CodelistService, SelectOption} from '../../app/services/codelist/codelist.service';
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
          externalLabel: 'Adressen'
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
            options: <SelectOption[]>[
              {label: 'Bahn', value: 'railway'},
              {label: 'Wasserstraßen und Gewässer', value: 'waters'},
              {label: 'Infrastruktur', value: 'infrastructure'},
              {label: 'Klima und Wetter', value: 'climate'},
              {label: 'Luft- und Raumfahrt', value: 'aviation'},
              {label: 'Straßen', value: 'roads'}
            ]
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
            options: <SelectOption[]>[
              {label: 'Bevölkerung und Gesellschaft', value: 'SOCI'},
              {label: 'Bildung, Kultur und Sport', value: 'EDUC'},
              {label: 'Energie', value: 'ENER'},
              {label: 'Gesundheit', value: 'HEAL'},
              {label: 'Internationale Themen', value: 'INTR'},
              {label: 'Justiz, Rechtssystem und öffentliche Sicherheit', value: 'JUST'},
              {label: 'Landwirtschaft, Fischerei, Forstwirtschaft und Nahrungsmittel', value: 'AGRI'},
              {label: 'Regierung und öffentlicher Sektor', value: 'GOVE'},
              {label: 'Regionen und Städte', value: 'REGI'},
              {label: 'Umwelt', value: 'ENVI'},
              {label: 'Verkehr', value: 'TRAN'},
              {label: 'Wirtschaft und Finanzen', value: 'ECON'},
              {label: 'Wissenschaft und Technologie', value: 'TECH'}
            ]
          }
        }]
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
              required: true
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
        wrappers: [],
        templateOptions: {
          mapOptions: {},
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
            className: 'date-field',
            wrappers: ['form-field'],
            templateOptions: {
              placeholder: 'TT.MM.JJJJ',
              appearance: 'outline'
            },
            hideExpression: (model: any) => model && model.rangeType === 'range'
          }, {
            key: 'timeSpanRange',
            type: 'date-range',
            className: 'date-field',
            wrappers: ['form-field'],
            templateOptions: {
              placeholder: 'Zeitraum eingeben ...',
              appearance: 'outline'
            },
            hideExpression: (model: any) => model && model.rangeType !== 'range'
          }]
        }
      ]
    }
  ];

  constructor(codelistService: CodelistService,
              codelistQuery?: CodelistQuery) {

    super(codelistService, codelistQuery);

  }

}
