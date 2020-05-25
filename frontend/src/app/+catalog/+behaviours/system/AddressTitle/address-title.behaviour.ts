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
  description = 'Definition für den Titel, der bei einer neuen Adresse generiert wird. Verfügbare Felder sind: firstName, ' +
    'lastName und organization';
  defaultActive = false;


  private addressTitleFunction: AddressTitleFn = (address: IgeDocument/* IMPORTANT FOR EVALUATION! */) => {
    // tslint:disable-next-line:no-eval
    return eval(this.data.template);
  };

  constructor(private documentService: DocumentService) {
    super();

    this.fields.push({
      key: 'template',
      type: 'input',
      templateOptions: {
        label: 'Template',
        placeholder: 'address.organization + ", " + address.lastName + ", " + address.firstName',
        appearance: 'outline',
        required: true
      },
      validators: {
        template: {
          expression: (c) => {
            let error = false;
            const address = {}; /* IMPORTANT FOR EVALUATION! */
            try {
              // tslint:disable-next-line:no-eval
              const testString = eval(c.value);
              if (testString && typeof (testString) !== 'string') {
                throw new Error('Not a String');
              }
            } catch (e) {
              console.log('Evaluation error');
              error = true;
            }
            return !error;
          },
          message: () => 'Der Wert ist ungültig'
        }
      }
    });
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
