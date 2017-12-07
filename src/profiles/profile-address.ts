import { FormGroup, Validators } from '@angular/forms';

export class ProfileAddress {
  id = 'ADDRESS';

  fields = [];

  behaviours = [];

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
