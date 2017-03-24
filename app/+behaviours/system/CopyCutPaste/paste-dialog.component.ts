import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {Modal} from 'ng2-modal';

@Component({
    template: `
      <modal #pasteModal modalClass="info" title="Einfügen" submitButtonLabel="Ok" (onSubmit)="pasteModal.close()">
          <modal-content>
              <p>Wohin wollen Sie die ausgewählten Datensätze kopieren?</p>
              <tree [showFolderEditButton]="false"></tree>
          </modal-content>
      </modal>
    `
})
export class PasteDialogComponent implements OnInit {

    @ViewChild( 'pasteModal' ) pasteModal: Modal;

    constructor(injector: Injector) {
        let moveMode = injector.get('moveMode');
        console.log('In PasteDialogComponent', moveMode);
    }

    ngOnInit() {
        this.pasteModal.open();
    }

}