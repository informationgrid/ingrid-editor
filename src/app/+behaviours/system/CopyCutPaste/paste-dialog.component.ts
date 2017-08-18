import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { Modal } from 'ngx-modal';
import { MoveMode, PasteCallback } from './enums';


@Component({
  template: `
    <modal #pasteModal modalClass="info" title="Einfügen" submitButtonLabel="Ok" (onSubmit)="submit()">
      <modal-content>
        <p>Wohin wollen Sie die ausgewählten Datensätze kopieren?</p>
        <tree [showFolderEditButton]="false" (onSelected)="handleSelected($event)"></tree>
      </modal-content>
    </modal>
  `
})
export class PasteDialogComponent implements OnInit {

  @ViewChild('pasteModal') pasteModal: Modal;
  callback: any = null;
  selection: any = null;
  moveMode: MoveMode = null;

  constructor(injector: Injector) {
    // TODO: also show button for document or tree copy/cut
    this.moveMode = injector.get(MoveMode);
    this.callback = injector.get(PasteCallback);

    console.log('In PasteDialogComponent', this.moveMode);
  }

  ngOnInit() {
    this.pasteModal.open();
  }

  handleSelected(evt: any) {
    this.selection = evt;
  }

  submit() {
    this.pasteModal.close();
    // TODO: adapt move mode when sub trees shall be copied/moved
    this.callback(this.selection, this.moveMode.mode);
  }

}
