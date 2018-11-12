import {Inject, Injectable} from '@angular/core';
import {FormularService} from '../../../services/formular/formular.service';
import {DocumentService} from '../../../services/document/document.service';
import {Plugin} from '../../plugin';
import { Subscription } from 'rxjs/index';

@Injectable({
  providedIn: 'root'
})
export class CreateDocRulesPlugin extends Plugin {
  id = 'plugin.create.doc';
  _name = 'Regeln für neues Dokument';
  defaultActive = true;

  description = `
    Diese Regeln beschreiben wie ein neuer Datensatz angelegt wird. Abhängig von dem ausgewählten Datensatz wird
    entschieden, welcher darunter angelegt werden darf.
  `;
  subscription: Subscription;

  get name() {
    return this._name;
  }

  constructor(@Inject( FormularService ) private formService: FormularService,
              @Inject( DocumentService ) private storageService: DocumentService) {
    super();
  }

  register() {
    super.register();

    this.subscription = this.formService.newDocumentSubject$.subscribe( data => {
      console.log( 'handle new documents', data );

      // if no document was selected then everything is allowed
      if (data.selectedDataset._profile === undefined) {
        return;
      }

      if (data.selectedDataset._profile === 'FOLDER') {
        if (data.selectedDataset.title === 'UVPs') {
          data.docTypes = data.docTypes.filter( (type: any) => type.id === 'UVP' );
        } else if (data.selectedDataset.title === 'Adressen') {
          data.docTypes = data.docTypes.filter( (type: any) => type.id === 'ADDRESS' );
        } else if (data.selectedDataset.title === 'Vorprüfungen') {
          data.docTypes = data.docTypes.filter( (type: any) => type.id === 'UVP' );
        }
        data.rootOption = false;
      } else {
        // TODO: check for parent folder title
        this.storageService.getPath( data.selectedDataset.id ).toPromise()
          .then( path => this.storageService.load( path[0] ).toPromise() )
          .then( rootNode => console.debug( 'Path: ', rootNode ) );

        data.docTypes = data.docTypes.filter( (type: any) => type.id !== 'FOLDER' );

      }
      console.log( 'handle new documents (after)', data );
    } );
  }

  unregister() {
    super.unregister();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
