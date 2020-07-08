import {Injectable} from '@angular/core';
import {Plugin} from '../../plugin';
import {AddressTitleFn, DocumentService} from '../../../../services/document/document.service';
import {IgeDocument} from '../../../../models/ige-document';

@Injectable({
  providedIn: 'root'
})
export class AddressTitleBehaviour extends Plugin {
  id = 'plugin.address.title';
  name = 'Template für die Generierung des Adressen-Titels';
  description = 'Definition für den Titel, der bei einer neuen Adresse generiert wird. Z.B.: organization + ", " + lastName + ", " + firstName<br>Verfügbare Felder sind: <b>firstName</b>, ' +
    '<b>lastName</b> und <b>organization</b>';
  defaultActive = false;


  private addressTitleFunction: AddressTitleFn = (address: IgeDocument/* IMPORTANT FOR EVALUATION! */) => {
    const value = this.replaceVariables(this.data.template);
    // tslint:disable-next-line:no-eval
    return eval(value);
  };

  constructor(private documentService: DocumentService) {
    super();

    this.fields.push({
      key: 'template',
      type: 'input',
      templateOptions: {
        placeholder: 'organization + ", " + lastName + ", " + firstName',
        appearance: 'outline',
        required: true
      },
      validators: {
        template: {
          expression: this.validateInputString(),
          message: () => 'Der Wert ist ungültig'
        }
      }
    });
  }

  private validateInputString() {
    return (c) => {
      let error = false;
      const address = { firstName: '', lastName: '', organization: ''}; /* IMPORTANT FOR EVALUATION! */
      try {
        const value = this.replaceVariables(c.value);

        // tslint:disable-next-line:no-eval
        const testString = eval(value);
        console.log('Eval string value: ', value);
        console.log('Eval string evaluated: ', testString);
        if (testString && typeof (testString) !== 'string') {
          throw new Error('Not a String');
        } else if (testString === undefined || testString.indexOf('undefined') !== -1) {
          throw new Error('One or more fields are not defined');
        }
      } catch (e) {
        console.log('Evaluation error');
        error = true;
      }
      return !error;
    };
  }

  private replaceVariables(text) {
    return text
      .replace('organization', 'address.organization')
      .replace('lastName', 'address.lastName')
      .replace('firstName', 'address.firstName');
  }

  register() {
    console.log('Register Address Title behaviour', this.data);
    super.register();

    this.documentService.registerAddressTitleFunction(this.addressTitleFunction);
  }

  unregister() {
    super.unregister();
    this.documentService.registerAddressTitleFunction(null);
  }
}
