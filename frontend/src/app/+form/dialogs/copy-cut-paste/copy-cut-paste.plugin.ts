import {Injectable} from '@angular/core';
import {DocumentService} from '../../../services/document/document.service';
import {Plugin} from '../../../+behaviours/plugin';
import {FormToolbarService, Separator, ToolbarItem} from '../../toolbar/form-toolbar.service';
import {UpdateType} from '../../../models/update-type.enum';
import {ModalService} from '../../../services/modal/modal.service';
import {PasteDialogComponent} from './paste-dialog.component';
import {CopyMoveEnum} from './enums';
import {Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';

@Injectable()
export class CopyCutPastePlugin extends Plugin {
  id = 'plugin.copy.cut.paste';
  _name = 'Copy Cut Paste';
  defaultActive = false;

  description = `
    Diese Regeln beschreiben das Kopieren, Ausschneiden und Einfügen von Datensätzen.
  `;
  subscription: Subscription;

  copiedDatasets: string[] = [];
  cutDatasets: string[] = [];

  get name() {
    return this._name;
  }

  constructor(private toolbarService: FormToolbarService,
              private storageService: DocumentService,
              private treeQuery: TreeQuery,
              private modalService: ModalService,
              private dialog: MatDialog) {
    super();
  }

  register() {
    super.register();

    const buttons: Array<ToolbarItem | Separator> = [
      {id: 'toolBtnCopyCutSeparator', pos: 30, isSeparator: true},
      {id: 'toolBtnCopy', tooltip: 'Copy', matSvgVariable: 'copy', eventId: 'COPY', pos: 40, active: false, menu: [
          {eventId: 'COPY', label: 'Kopieren'},
          {eventId: 'CUT', label: 'Verschieben'},
          {eventId: 'COPYTREE', label: 'Mit Teilbaum kopieren'},
          {eventId: 'CUTTREE', label: 'Mit Teilbaum verschieben'}
        ]}
      // {id: 'toolBtnCut', tooltip: 'Cut', cssClasses: 'content_cut', eventId: 'CUT', pos: 50, active: false}
    ];
    buttons.forEach((button) => this.toolbarService.addButton(button));

    /*this.subscription = this.storageService.afterLoadAndSet$.subscribe((data) => {

      if (data === null) {
        return;
      }

      this.toolbarService.setButtonState('toolBtnCopy', true);
      this.toolbarService.setButtonState('toolBtnCut', true);
    });*/

    // add event handler for revert
    this.toolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'COPY') {
        this.handleEvent(UpdateType.Copy);
        this.copy();
      } else if (eventId === 'CUT') {
        this.cut();
      }
    });

    // set button state according to selected documents
    this.treeQuery.selectActiveId().subscribe(data => {
      if (data.length === 0) {
        this.toolbarService.setButtonState('toolBtnCopy', false);
        // this.toolbarService.setButtonState('toolBtnCut', false);
      } else {
        this.toolbarService.setButtonState('toolBtnCopy', true);
        // this.toolbarService.setButtonState('toolBtnCut', true);
      }
    });
  }

  private handleEvent(type: UpdateType) {
    this.storageService.datasetsChanged$.next({
      type: type,
      data: null
    });
  }

  copy() {
    // remove last remembered copied documents
    // this.copiedDatasets = this.formService.getSelectedDocuments().map(doc => <string>doc.id);

    this.dialog.open(PasteDialogComponent, {
      data: {mode: CopyMoveEnum.COPY}
    }).afterClosed().subscribe(result => {
      if (result) {
        console.log('result', result);
        this.paste(result, CopyMoveEnum.COPY);
      }
    });
  }

  cut() {
    // remove last remembered copied documents
    // this.cutDatasets = this.formService.getSelectedDocuments().map(doc => <string>doc.id);

    this.dialog.open(PasteDialogComponent, {
      data: {mode: CopyMoveEnum.MOVE}
    }).afterClosed().subscribe(result => {
      if (result) {
        console.log('result', result);
        this.paste(result, CopyMoveEnum.MOVE);
      }
    });
  }

  paste(targetNode: any, mode: CopyMoveEnum) {
    console.log('is paste');
    // TODO: add subtree pasting
    const dest = targetNode[0].id;
    const includeTree = false;

    let result = null;
    if (mode === CopyMoveEnum.COPY) {
      result = this.storageService.copy(this.copiedDatasets, dest, includeTree);
    } else {
      result = this.storageService.move(this.cutDatasets, dest, includeTree);

    }

    result.subscribe(
      () => this.handleAfterPaste()
    );
  }

  private handleAfterPaste() {
    // TODO: this.messageService.add({severity: 'success', summary: 'Datensatz eingefügt'});
  }

  unregister() {
    super.unregister();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // remove from same index since buttons take the neighbor place after deletion
    this.toolbarService.removeButton('toolBtnCopy');
    // this.toolbarService.removeButton('toolBtnCut');
    this.toolbarService.removeButton('toolBtnCopyCutSeparator');
  }
}
