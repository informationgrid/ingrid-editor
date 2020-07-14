import {Injectable} from '@angular/core';
import {DocumentService} from '../../../services/document/document.service';
import {Plugin} from '../../../+catalog/+behaviours/plugin';
import {FormToolbarService, Separator, ToolbarItem} from '../../form-shared/toolbar/form-toolbar.service';
import {UpdateType} from '../../../models/update-type.enum';
import {ModalService} from '../../../services/modal/modal.service';
import {PasteDialogComponent, PasteDialogOptions} from './paste-dialog.component';
import {CopyMoveEnum} from './enums';
import {merge, Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';
import {MessageService} from '../../../services/message.service';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
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
              private addressTreeQuery: AddressTreeQuery,
              private modalService: ModalService,
              private messageService: MessageService,
              private dialog: MatDialog) {
    super();
  }

  register() {
    super.register();

    const buttons: Array<ToolbarItem | Separator> = [
      {id: 'toolBtnCopyCutSeparator', pos: 30, isSeparator: true},
      {
        id: 'toolBtnCopy',
        tooltip: 'Kopieren / Verschieben',
        matSvgVariable: 'Kopieren-Ausschneiden',
        eventId: 'COPY',
        pos: 40,
        active: false,
        menu: [
          {eventId: 'COPY', label: 'Kopieren', active: true},
          {eventId: 'CUT', label: 'Verschieben'},
          {eventId: 'COPYTREE', label: 'Mit Teilbaum kopieren'},
          {eventId: 'CUTTREE', label: 'Mit Teilbaum verschieben'}
        ]
      }
    ];
    buttons.forEach((button) => this.toolbarService.addButton(button));

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
    merge(
      this.treeQuery.selectActiveId(),
      this.addressTreeQuery.selectActiveId()
    ).pipe(
      untilDestroyed(this)
    ).subscribe(data => {
      if (data.length === 0) {
        this.toolbarService.setButtonState('toolBtnCopy', false);
      } else {
        this.toolbarService.setButtonState('toolBtnCopy', true);

        this.toolbarService.setMenuItemStateOfButton('toolBtnCopy', 'COPYTREE', false);
        this.toolbarService.setMenuItemStateOfButton('toolBtnCopy', 'CUTTREE', false);
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

    this.dialog.open(PasteDialogComponent, {
      minWidth: '400px',
      data: {
        titleText: 'Kopieren',
        buttonText: 'Kopieren',
        forAddress: this.forAddress
      } as PasteDialogOptions
    }).afterClosed().subscribe(result => {
      if (result) {
        console.log('result', result);
        this.paste(result.selection.parent, CopyMoveEnum.COPY);
      }
    });
  }

  cut() {
    // remove last remembered copied documents

    this.dialog.open(PasteDialogComponent, {
      minWidth: '400px',
      data: {
        titleText: 'Verschieben',
        buttonText: 'Verschieben',
        forAddress: this.forAddress
      } as PasteDialogOptions
    }).afterClosed().subscribe(result => {
      if (result) {
        console.log('result', result);
        this.paste(result.selection.parent, CopyMoveEnum.MOVE);
      }
    });
  }

  paste(dest: string, mode: CopyMoveEnum) {

    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;

    // TODO: add subtree pasting
    const includeTree = false;

    const selectedDatasets = query.getActiveId().map(id => id.toString());

    let result;
    if (mode === CopyMoveEnum.COPY) {
      result = this.storageService.copy(selectedDatasets, dest, includeTree);
    } else {
      result = this.storageService.move(selectedDatasets, dest, includeTree);

    }

    result.subscribe();
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
