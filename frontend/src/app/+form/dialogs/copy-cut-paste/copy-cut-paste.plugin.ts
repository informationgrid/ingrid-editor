import {Injectable} from '@angular/core';
import {DocumentService} from '../../../services/document/document.service';
import {Plugin} from '../../../+catalog/+behaviours/plugin';
import {FormToolbarService, Separator, ToolbarItem} from '../../form-shared/toolbar/form-toolbar.service';
import {UpdateType} from '../../../models/update-type.enum';
import {ModalService} from '../../../services/modal/modal.service';
import {PasteDialogComponent, PasteDialogOptions} from './paste-dialog.component';
import {merge, Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';
import {MessageService} from '../../../services/message.service';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {filter, switchMap, take} from 'rxjs/operators';

@Injectable()
export class CopyCutPastePlugin extends Plugin {
  id = 'plugin.copy.cut.paste';
  _name = 'Copy Cut Paste';
  defaultActive = false;

  description = `
    Diese Regeln beschreiben das Kopieren, Ausschneiden und Einfügen von Datensätzen.
  `;

  copiedDatasets: string[] = [];
  cutDatasets: string[] = [];

  get name() {
    return this._name;
  }

  constructor(private toolbarService: FormToolbarService,
              private documentService: DocumentService,
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
          {eventId: 'COPY', label: 'Kopieren'},
          {eventId: 'COPYTREE', label: 'Kopieren mit Teilbaum'},
          {eventId: 'CUT', label: 'Verschieben (inkl. Teilbaum)'}
        ]
      }
    ];
    buttons.forEach((button) => this.toolbarService.addButton(button));

    // add event handler for revert
    const toolbarEventSubscription = this.toolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'COPY') {
        // this.handleEvent(UpdateType.Copy);
        this.copy();
      } else if (eventId === 'CUT') {
        this.cut();
      } else if (eventId === 'COPYTREE') {
        this.copy(true);
      }
    });

    // set button state according to selected documents
    const treeQuerySubscription = merge(
      this.treeQuery.selectActiveId(),
      this.addressTreeQuery.selectActiveId()
    ).subscribe(data => {
      if (data.length === 0) {
        this.toolbarService.setButtonState('toolBtnCopy', false);
      } else {
        this.toolbarService.setButtonState('toolBtnCopy', true);

        // set state of menu items
        this.toolbarService.setMenuItemStateOfButton('toolBtnCopy', 'COPY', true);
        this.toolbarService.setMenuItemStateOfButton('toolBtnCopy', 'CUT', true);
        this.getQuery().selectEntity(data[0]).pipe(
          filter(item => item !== undefined),
          take(1)
        ).subscribe(entity => {
          this.toolbarService.setMenuItemStateOfButton('toolBtnCopy', 'COPYTREE', entity._hasChildren);
        });
      }
    });

    this.subscriptions.push(toolbarEventSubscription, treeQuerySubscription);
  }

  private handleEvent(type: UpdateType) {
    this.documentService.datasetsChanged$.next({
      type: type,
      data: null
    });
  }

  copy(includeTree = false) {

    // remove last remembered copied documents
    this.showDialog('Kopieren').pipe(
      switchMap(result => this.documentService.copy(this.getSelectedDatasets(), result.selection.parent, includeTree, this.forAddress))
    ).subscribe();

  }

  cut() {

    // remove last remembered copied documents
    this.showDialog('Verschieben').pipe(
      switchMap(result => this.documentService.move(this.getSelectedDatasets(), result.selection.parent, this.forAddress))
    ).subscribe();

  }

  showDialog(title: string): Observable<any> {
    return this.dialog.open(PasteDialogComponent, {
      minWidth: '400px',
      maxWidth: '600px',
      data: {
        titleText: title,
        buttonText: 'Einfügen',
        forAddress: this.forAddress
      } as PasteDialogOptions
    }).afterClosed().pipe(
      filter(result => result) // only confirmed dialog
    )
  }

  private getSelectedDatasets() {
    return this.getQuery().getActiveId().map(id => id.toString());
  }

  private getQuery() {
    return this.forAddress ? this.addressTreeQuery : this.treeQuery;
  }

  unregister() {
    super.unregister();

    // remove from same index since buttons take the neighbor place after deletion
    this.toolbarService.removeButton('toolBtnCopy');
    this.toolbarService.removeButton('toolBtnCopyCutSeparator');
  }
}
