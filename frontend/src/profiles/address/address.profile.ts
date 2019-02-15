import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EventManager } from '@angular/platform-browser';
import { Profile } from '../../app/services/formular/profile';
import { Container, DropdownField, TextareaField, TextboxField } from '../../app/+form/controls';
import { Behaviour } from '../../app/+behaviours/behaviours';
import { DocumentService } from '../../app/services/document/document.service';
import { OpenTableField } from '../../app/+form/controls/field-opentable';
import { CodelistService } from '../../app/services/codelist/codelist.service';

export class ProfileAddress implements Profile {
  id = 'ADDRESS';

  label = 'Adresse';

  treeIconClass = 'fa fa-address-card-o';

  countrySelect = new DropdownField({
    key: 'country',
    label: 'Land',
    domClass: 'half',
    options: []
  });
  adminAreaSelect = new DropdownField({
    key: 'adminArea',
    label: 'Verwaltungsgebiet',
    domClass: 'half',
    options: []
  });

  fields = [
    new TextboxField({
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
  ];

  behaviours: Behaviour[] = [
    {
      id: 'addressTaskWithWork',
      title: 'Die Aufgaben müssen das Wort "work" enthalten',
      description: '',
      isProfileBehaviour: true,
      defaultActive: true,
      register: function (form: FormGroup, eventManager: EventManager) {
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
      register: (form: FormGroup, eventManager: EventManager) => {
        // when using valueChanges, then we only must react after a document has been loaded
        // we only want to react, when the user did any action (click or chose a new item from select box or added a new value
        const self = this;
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

  constructor(storageService: DocumentService, codelistService: CodelistService) {
    codelistService.byIds(['6200', '6400']).then(codelists => {
      this.countrySelect.options = codelists[0];
      this.adminAreaSelect.options = codelists[1];
    }).catch(err => console.error(err)/*modalService.showError(err)*/);
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

  getTitle(doc: any) {
    if (!doc.firstName && !doc.lastName) {
      return null;
    } else {
      return doc.firstName + ' ' + doc.lastName;
    }
  }

  getTitleFields() {
    return ['firstName', 'lastName'];
  }
}
