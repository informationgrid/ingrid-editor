import {ComponentFactoryResolver, Injectable, ReflectiveInjector, ValueProvider} from '@angular/core';
import {FormToolbarService} from '../../../+form/toolbar/form-toolbar.service';
import {FormularService} from '../../../services/formular/formular.service';
import {ModalService} from '../../../services/modal/modal.service';
import {StorageService} from '../../../services/storage/storage.service';
import {Plugin} from '../../plugin';
import {DeleteDialogComponent} from './delete-dialog.component';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class DeleteDocsPlugin extends Plugin {
  id = 'plugin.deleteDocs';
  _name = 'Delete Docs Plugin';

  docsToDelete = [];

  subscription: Subscription;

  get name() {
    return this._name;
  }

  constructor(private formToolbarService: FormToolbarService,
              private formService: FormularService,
              private modalService: ModalService,
              private storageService: StorageService,
              private _cr: ComponentFactoryResolver) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    this.formToolbarService.addButton(
      {id: 'toolBtnRemove', tooltip: 'Remove', cssClasses: 'delete', eventId: 'DELETE', active: false}
    );

    const loadSaveSubscriber = this.formToolbarService.getEventObserver().subscribe(eventId => {
      if (eventId === 'DELETE') {
        this.deleteDoc();
      }
    });

    this.subscription = this.formService.selectedDocuments$.subscribe( data => {
      this.formToolbarService.setButtonState(
        'toolBtnRemove',
        data.length > 0);
    } );
  }

  deleteDoc() {
    const docs = this.formService.getSelectedDocuments();
    this.docsToDelete = docs;

    // show dialog where to copy the dataset(s)
    let factory = this._cr.resolveComponentFactory( DeleteDialogComponent );

    let providers = ReflectiveInjector.resolve( [
      {provide: 'docs', useValue: docs}
    ] );
    const popInjector = ReflectiveInjector.fromResolvedProviders( providers, this.modalService.containerRef.parentInjector );
    this.modalService.containerRef.createComponent( factory, null, popInjector );
  }

  unregister() {
    super.unregister();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.formToolbarService.removeButton('toolBtnRemove');
  }

}
