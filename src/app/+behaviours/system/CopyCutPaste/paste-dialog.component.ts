import {AfterViewInit, Component, Injector, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CopyMoveEnum, MoveMode, PasteCallback} from './enums';
import { MatDialog } from '@angular/material';

@Component({
  template: `
    <ng-template #pasteModal>
      <div class="modal-header">
        <h4 class="modal-title pull-left">Einfügen</h4>
        <!--<button type="button" class="close pull-right" aria-label="Close" (click)="pasteModalRef.hide()">
          <span aria-hidden="true">&times;</span>
        </button>-->
      </div>
      <div class="modal-body">
        <p>Wohin wollen Sie die ausgewählten Datensätze kopieren?</p>
        <ige-tree [showFolderEditButton]="false" (selected)="handleSelected($event)"></ige-tree>
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

  callback: any = null;
  selection: any = null;
  moveMode: MoveMode = null;

  copyOrMoveText: string;

  constructor(injector: Injector, private dialog: MatDialog) {
    // TODO: also show button for document or tree copy/cut
    this.moveMode = injector.get(MoveMode);
    this.callback = injector.get(PasteCallback);

    console.log('In PasteDialogComponent', this.moveMode);
  }

  ngAfterViewInit(): void {
  }

  ngOnInit() {
    this.copyOrMoveText = this.moveMode.mode === CopyMoveEnum.COPY ? 'Kopieren' : 'Verschieben';
    // TODO: const pasteModalRef = this.dialog.open(this.pasteModal);

  }

  handleSelected(evt: any) {
    this.selection = evt;
  }

  submit() {
    // this.pasteModalRef.hide();
    // TODO: adapt move mode when sub trees shall be copied/moved
    this.callback(this.selection, this.moveMode.mode);
  }

}
