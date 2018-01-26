import {Component, Injector, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {StorageService} from '../../../services/storage/storage.service';
import {Router} from '@angular/router';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';

@Component({
  template: `
    <ng-template #deleteConfirmModal>
      <div class="modal-header">
        <h4 class="modal-title">Löschen</h4>
        <button type="button" class="close pull-right" aria-label="Close" (click)="modalRef.hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p>Möchten Sie wirklich diese Datensätze löschen:</p>
        <ul>
          <li *ngFor="let doc of docsToDelete">{{doc.label}}</li>
        </ul>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="doDelete()">Ja</button>
        <button type="button" class="btn btn-link" (click)="modalRef.hide()">Nein</button>
      </div>
    </ng-template>
    <!--<modal #deleteConfirmModal title="Löschen" cancelButtonLabel="Nein" submitButtonLabel="Ja" (onSubmit)="doDelete()">
      <modal-content>
        <p>Möchten Sie wirklich diese Datensätze löschen:</p>
        <ul>
          <li *ngFor="let doc of docsToDelete">{{doc.label}}</li>
        </ul>
      </modal-content>
    </modal>-->
  `
})
export class DeleteDialogComponent implements OnInit {

  @ViewChild('deleteConfirmModal') deleteConfirmModal: TemplateRef<any>;
  modalRef: BsModalRef;
  docsToDelete: any[];

  constructor(injector: Injector, private modalService: BsModalService, private storageService: StorageService,
              private router: Router) {
    this.docsToDelete = injector.get('docs' );
  }

  ngOnInit() {
    setTimeout( () => this.modalRef = this.modalService.show(this.deleteConfirmModal, {class: 'modal-alert'}), 0);
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
        this.router.navigate( ['/form']);
      // }
    } catch (ex) {
      console.error( 'Could not delete' );
    }
    this.modalRef.hide();
  }
}
