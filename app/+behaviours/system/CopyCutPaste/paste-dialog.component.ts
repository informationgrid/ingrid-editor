import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {Modal} from 'ng2-modal';
import {MoveMode} from './copy-cut-paste.behaviour';

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

  @ViewChild('pasteModal') pasteModal: Modal;

  constructor(injector: Injector) {
    // TODO: also show button for document or tree copy/cut
    let moveMode = injector.get(MoveMode);
    console.log('In PasteDialogComponent', moveMode);
  }

  ngOnInit() {
    this.pasteModal.open();
  }

}