import { Plugin } from '../plugin';
import {FormToolbarService} from "../../+form/toolbar/form-toolbar.service";
import {Inject} from "@angular/core";
import {StorageService} from "../../services/storage/storage.service";
import {FormularService} from "../../services/formular/formular.service";
import {ModalService} from "../../services/modal/modal.service";
import {Subscription} from "rxjs";

export class CreateDocRulesPlugin extends Plugin {
  id = 'plugin.create.doc';
  _name = 'Regeln für neues Dokument';

  subscription: Subscription;

  get name() {
    return this._name;
  }

  constructor(@Inject( FormToolbarService ) private formToolbarService: FormToolbarService,
              @Inject( FormularService ) private formService: FormularService,
              @Inject( ModalService ) private modalService: ModalService,
              @Inject( StorageService ) private storageService: StorageService) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    this.subscription = this.formService.newDocumentSubject$.subscribe( data => {
      console.log('handle new documents', data);

      if (data.selectedDataset._profile === 'UVP') {
        data.docTypes = data.docTypes.filter((type: any) => type.id === 'ADDRESS');
        data.rootOption = false;
      } else {
        data.docTypes = data.docTypes.filter((type: any) => type.id === 'UVP');

      }
      console.log('handle new documents (after)', data);
    });
  }

  unregister() {
    super.unregister();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}