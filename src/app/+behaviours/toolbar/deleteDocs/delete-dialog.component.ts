import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {Modal} from 'ngx-modal';
import {StorageService} from '../../../services/storage/storage.service';
import {Router} from '@angular/router';

@Component({
  template: `
    <modal #deleteConfirmModal title="Löschen" cancelButtonLabel="Nein" submitButtonLabel="Ja" (onSubmit)="doDelete()">
      <modal-content>
        <p>Möchten Sie wirklich diese Datensätze löschen:</p>
        <ul>
          <li *ngFor="let doc of docsToDelete">\{\{doc.label}}</li>
        </ul>
      </modal-content>
    </modal>
  `
})
export class DeleteDialogComponent implements OnInit {

  @ViewChild('deleteConfirmModal') deleteConfirmModal: Modal;
  docsToDelete: any[];

  constructor(injector: Injector, private storageService: StorageService,
              private router: Router) {
    this.docsToDelete = injector.get('docs' );
  }

  ngOnInit() {
    this.deleteConfirmModal.open();
  }

  doDelete() {
    try {
      const ids = this.docsToDelete.map(doc => doc.id);
      this.storageService.delete(ids);

      // clear form if we removed the currently opened doc
      // and change route in case we try to reload page which would load the deleted document
      // if (this.data._id === ids[0]) {
      //   this.form = null;
        // TODO: use constant for no document selected
        this.router.navigate( ['/form', -2]);
      // }
    } catch (ex) {
      console.error( 'Could not delete' );
    }
    this.deleteConfirmModal.close();
  }
}
