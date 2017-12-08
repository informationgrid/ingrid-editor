import { FormGroup, Validators } from '@angular/forms';
import { EventManager } from '@angular/platform-browser';
import { Behaviour } from '../app/+behaviours/behaviours';
import { StorageService } from '../app/services/storage/storage.service';

export class ProfileAddress {
  id = 'ADDRESS';

  fields = [];

  formIsNotLoaded = true;

  behaviours: Behaviour[] = [
    {
      id: 'addressTaskWithWork',
      title: 'Die Aufgaben müssen das Wort "work" enthalten',
      description: '',
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
      defaultActive: true,
      register: (form: FormGroup, eventManager: EventManager) => {
        // when using valueChanges, then we only must react after a document has been loaded
        // we only want to react, when the user did any action (click or chose a new item from select box or added a new value
        const self = this;
        form.get('address.adminArea').valueChanges.subscribe(value => {
          if (self.formIsNotLoaded) {
            return null;
          }
          if (value.id === '5') {
            form.get('serviceTimes').setValue('Wir leben gesund!');
          }
        });
      },
      unregister: function () {
      }
    }
  ];

  constructor(storageService: StorageService) {
    storageService.beforeLoad.asObservable().subscribe(() => this.formIsNotLoaded = true);
    storageService.afterLoadAndSet$.subscribe(() => setTimeout(() => this.formIsNotLoaded = false, 1000));
  }

  applyValidations(form: FormGroup) {
    console.log('Address Form validation !?', form);
    /*form.root.get('postbox').validator = function (fc: FormControl) {
      return fc.value && fc.value.length >= 3 ? null : {
        validateTop: {valid: false, error: 'Der Titel muss aus mindestens 3 Zeichen bestehen!'}
      };
    };*/
    form.root.get('address.postbox').validator = Validators.required;
  };

}
