import {AfterViewInit, Component, Injector, OnInit, TemplateRef, ViewChild} from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import {CopyMoveEnum, MoveMode, PasteCallback} from './enums';


@Component({
  template: `
    <ng-template #pasteModal>
      <div class="modal-header">
        <h4 class="modal-title pull-left">Einfügen</h4>
        <button type="button" class="close pull-right" aria-label="Close" (click)="pasteModalRef.hide()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p>Wohin wollen Sie die ausgewählten Datensätze kopieren?</p>
        <tree [showFolderEditButton]="false" (selected)="handleSelected($event)"></tree>
      </div>
      <div class="modal-footer">
        <button class="btn btn-link" (click)="submit()">{{copyOrMoveText}}</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .modal-body {
      height: 300px;
      overflow: auto;
    }
  `]
})
export class PasteDialogComponent implements OnInit, AfterViewInit {

  @ViewChild('pasteModal') pasteModal: TemplateRef<any> = null;


  pasteModalRef: BsModalRef = null;
  callback: any = null;
  selection: any = null;
  moveMode: MoveMode = null;

  copyOrMoveText: string;

  constructor(injector: Injector, private modalService: BsModalService) {
    // TODO: also show button for document or tree copy/cut
    this.moveMode = injector.get(MoveMode);
    this.callback = injector.get(PasteCallback);

    console.log('In PasteDialogComponent', this.moveMode);
  }

  ngAfterViewInit(): void {
  }

  ngOnInit() {
    this.copyOrMoveText = this.moveMode.mode === CopyMoveEnum.COPY ? "Kopieren" : "Verschieben";
    setTimeout( () => this.pasteModalRef = this.modalService.show(this.pasteModal), 0);

  }

  handleSelected(evt: any) {
    this.selection = evt;
  }

  submit() {
    this.pasteModalRef.hide();
    // TODO: adapt move mode when sub trees shall be copied/moved
    this.callback(this.selection, this.moveMode.mode);
  }

}
