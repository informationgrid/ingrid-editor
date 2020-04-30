import {FormGroup} from '@angular/forms';
import {Behaviour} from '../../app/+behaviours/behaviours';
import {DocumentService} from '../../app/services/document/document.service';
import {CodelistService} from '../../app/services/codelist/codelist.service';
import {FormlyFieldConfig} from '@ngx-formly/core';
import {from} from 'rxjs';
import {BaseProfile} from '../base.profile';

export class ProfileAddress extends BaseProfile {
  // must be same as DBClass!
  id = 'AddressDoc';

  label = 'Adresse';

  iconClass = 'Freie-Adresse';

  isAddressProfile = true;

  profileFields = <FormlyFieldConfig[]>[
    {
      wrappers: ['section'],
      templateOptions: {
        label: 'Allgemeines'
      },
      fieldGroup: [
        {
          fieldGroupClassName: 'display-flex',
          wrappers: ['panel'],
          templateOptions: {
            externalLabel: 'Name'
          },
          fieldGroup: [{
            key: 'firstName',
            className: 'flex-1 firstName',
            type: 'input',
            wrappers: ['form-field'],
            templateOptions: {
              label: 'Vorname',
              appearance: 'outline'
            }
          }, {
            key: 'lastName',
            className: 'flex-1 lastName',
            type: 'input',
            wrappers: ['form-field'],
            templateOptions: {
              label: 'Nachname',
              appearance: 'outline'
            }
          }]
        }, {
          key: 'contact',
          type: 'ngx-table',
          wrappers: ['panel'],
          templateOptions: {
            externalLabel: 'Kommunikation',
            columns: [
              {key: 'name', editable: true, label: 'Name'},
              {key: 'type', editable: false, label: 'Art'}
            ]
          }
        }, {
          key: 'contact-link',
          type: 'doc-reference',
          wrappers: ['panel'],
          templateOptions: {
            externalLabel: 'Kommunikation-Link',
            filter: {
              docType: 'ADDRESS'
            }
          }
        }, {
          key: 'address',
          wrappers: ['panel'],
          templateOptions: {
            externalLabel: 'Adresse'
          },
          fieldGroup: [{
            fieldGroupClassName: 'display-flex',
            fieldGroup: [{
              key: 'street',
              className: 'flex-1',
              type: 'input',
              templateOptions: {
                label: 'Strasse',
                appearance: 'outline'
              }
            }, {
              key: 'number',
              className: 'flex-1',
              type: 'input',
              templateOptions: {
                label: 'Hausnummer',
                appearance: 'outline'
              }
            }]
          }, {
            fieldGroupClassName: 'display-flex',
            fieldGroup: [{
              key: 'PO',
              className: 'flex-1',
              type: 'input',
              templateOptions: {
                label: 'PLZ',
                appearance: 'outline'
              }
            }, {
              key: 'city',
              className: 'flex-3',
              type: 'input',
              templateOptions: {
                label: 'Stadt',
                appearance: 'outline'
              }
            }, {
              key: 'country',
              className: 'flex-3',
              type: 'select',
              templateOptions: {
                label: 'Land',
                appearance: 'outline',
                placeholder: 'Bitte wählen',
                options: this.getCodelistForSelect(6200)
              }
            }]
          }]
        }, {
          key: 'tasks',
          type: 'textarea',
          wrappers: ['panel', 'form-field'],
          templateOptions: {
            externalLabel: 'Aufgaben',
            rows: 2,
            appearance: 'outline',
            autosize: true,
            autosizeMaxRows: 5
          }
        }, {
          key: 'serviceTimes',
          type: 'input',
          wrappers: ['panel', 'form-field'],
          templateOptions: {
            externalLabel: 'Servicezeiten',
            appearance: 'outline',
            autosize: true,
            autosizeMaxRows: 5
          }
        }
      ]
    }];

  /*new TextboxField({
    key: 'firstName',
    label: 'Vorname',
    domClass: 'half',
    order: 10,
    validator: [
      // Validators.required,
      // Validators.minLength(4),
      function (fc: FormControl) {
        const firstNameIsLong = fc.value && fc.value.length >= 5;
        const lastNameHasValue = fc.root.get('lastName') && fc.root.get('lastName').value
          ? fc.root.get('lastName').value.length > 0
          : false;
        return firstNameIsLong || lastNameHasValue
          ? null
          : {
            other: {
              valid: false,
              error: 'Der Titel muss aus mindestens 5 Zeichen bestehen oder es muss ein Nachname gesetzt sein.',
              special: 'abc'
            }
          };
      }
    ]
  }),

  new TextboxField({
    key: 'lastName',
    label: 'Nachname',
    domClass: 'half',
    order: 20,
    validator: function (fc: FormControl) {
      const firstName = fc.root.get('firstName');
      if (firstName) {
        firstName.updateValueAndValidity();
      }
    }
  }),

  new OpenTableField({
    key: 'contact',
    label: 'Kommunikation',
    order: 30,
    domClass: 'half',
    height: 145,
    columns: [
      {
        editor: new DropdownField({
          key: 'type',
          label: 'Typ',
          options: [{id: 'email', value: 'Email'}, {id: 'phone', value: 'Telefon'}]
        }),
        width: '100px'
      },
      {
        editor: new TextboxField({
          key: 'value',
          label: 'Wert'
        })
      }
    ]
  }),

  new Container({
    key: 'address',
    domClass: 'half',
    order: 40,
    children: [
      new TextboxField({
        key: 'street',
        label: 'Strasse',
        domClass: 'three-quarter'
      }),
      new TextboxField({
        key: 'houseNumber',
        label: 'Hausnr',
        domClass: 'quarter'
      }),
      new TextboxField({
        key: 'postbox',
        label: 'PLZ',
        domClass: 'quarter'
      }),
      new TextboxField({
        key: 'city',
        label: 'Stadt',
        domClass: 'three-quarter'
      }),

      this.adminAreaSelect,

      this.countrySelect
    ]
  }),

  new TextareaField({
    key: 'tasks',
    label: 'Aufgaben',
    rows: 2,
    order: 40
  }),

  new TextboxField({
    key: 'serviceTimes',
    label: 'Servicezeiten',
    order: 40
  })
];*/

  behaviours: Behaviour[] = [
    {
      id: 'addressTaskWithWork',
      title: 'Die Aufgaben müssen das Wort "work" enthalten',
      description: '',
      isProfileBehaviour: true,
      defaultActive: true,
      register: function (form: FormGroup) {
        // this behaviour should be a validator for a field!
        form.get('tasks').validator = function (fc) {
          return fc.value && fc.value.indexOf('work') !== -1 ? null : {
            other: {valid: false, error: 'Die Aufgaben müssen das Wort "work" enthalten'}
          };
        };
      },
      unregister: function () {
      }
    },
    {
      id: 'addressAdminArea',
      title: 'Wenn "Gesundheit", dann Text in Servicezeiten',
      description: '',
      isProfileBehaviour: true,
      defaultActive: true,
      register: (form: FormGroup) => {
        // when using valueChanges, then we only must react after a document has been loaded
        // we only want to react, when the user did any action (click or chose a new item from select box or added a new value
        form.get('address.adminArea').valueChanges.subscribe(value => {

          // TODO: validations should be attached directly to the field to
          //       avoid initialization problems
          /*if (self.formIsNotLoaded) {
            return null;
          }*/
          if (value && value.id === '5') {
            form.get('serviceTimes').setValue('Wir leben gesund!');
          }
        });
      },
      unregister: function () {
      }
    }
  ];

  constructor(storageService: DocumentService, private codelistService: CodelistService) {
    super();

    this.fields.push(...this.profileFields);

    /*codelistService.byIds(['6200', '6400']).then(codelists => {
      this.countrySelect.options = codelists[0];
      this.adminAreaSelect.options = codelists[1];
    }).catch(err => console.error(err)/!*modalService.showError(err)*!/);*/
  }

  applyValidations(form: FormGroup) {
    console.log('Address Form validation !?', form);
    /*form.root.get('postbox').validator = function (fc: FormControl) {
      return fc.value && fc.value.length >= 3 ? null : {
        validateTop: {valid: false, error: 'Der Titel muss aus mindestens 3 Zeichen bestehen!'}
      };
    };*/
    // form.root.get('address.postbox').validator = Validators.required;


  };

  private getCodelistForSelect(codelistId: number) {

    const codelistResult = this.codelistService.byId(codelistId + '')
      .then(codelist => {
        return codelist
          .map(cl => {
            return {label: cl.value, value: cl.id}
          })
          .sort((a, b) => a.label.localeCompare(b.label));
      });
    return from(codelistResult);
  }

}
