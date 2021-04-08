import {Injectable} from '@angular/core';
import {DocumentService} from '../../../services/document/document.service';
import {Plugin} from '../../../+catalog/+behaviours/plugin';
import {FormToolbarService, Separator, ToolbarItem} from '../../form-shared/toolbar/form-toolbar.service';
import {ModalService} from '../../../services/modal/modal.service';
import {PasteDialogComponent, PasteDialogOptions} from './paste-dialog.component';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';
import {MessageService} from '../../../services/message.service';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {filter, switchMap} from 'rxjs/operators';
import {ID} from '@datorama/akita';

@Injectable()
export class CopyCutPastePlugin extends Plugin {
  id = 'plugin.copy.cut.paste';
  _name = 'Copy Cut Paste';
  group = 'Toolbar';
  defaultActive = true;

  description = `
    Diese Regeln beschreiben das Kopieren, Ausschneiden und Einfügen von Datensätzen.
  `;

  private query: TreeQuery | AddressTreeQuery;

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

    this.query = this.forAddress ? this.addressTreeQuery : this.treeQuery;

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
    const treeQuerySubscription = this.query.selectActiveId()
      .subscribe(async data => {
        if (data.length === 0) {
          this.toolbarService.setButtonState('toolBtnCopy', false);
        } else {
          this.toolbarService.setButtonState('toolBtnCopy', true);

          // set state of menu items
          this.toolbarService.setMenuItemStateOfButton('toolBtnCopy', 'COPY', true);
          this.toolbarService.setMenuItemStateOfButton('toolBtnCopy', 'CUT', true);

          const parentWithChildrenSelected = await this.checkForParentsWithSelectedChildren(data);
          this.toolbarService.setMenuItemStateOfButton('toolBtnCopy', 'COPYTREE', parentWithChildrenSelected);
        }
      });

    this.subscriptions.push(toolbarEventSubscription, treeQuerySubscription);
  }

  private async checkForParentsWithSelectedChildren(data: ID[]): Promise<boolean> {
    return new Promise(resolve => {
      return this.checkForParentsWithSelectedChildrenLoop(data, resolve);
    });
  }

  private checkForParentsWithSelectedChildrenLoop(data: ID[], resolve, tries = 10) {
    const allNodesLoaded = data.every(id => this.query.getEntity(id));
    if (allNodesLoaded) {
      resolve(data.some(id => this.query.getEntity(id)._hasChildren));
    } else {
      if (tries === 0) {
        console.warn('Node information could not be received from store');
        resolve(false);
      } else {
        console.log('Tree does not have node information yet. Waiting 200ms ...');
        setTimeout(() => this.checkForParentsWithSelectedChildrenLoop(data, resolve, --tries), 200);
      }
    }
  }

  copy(includeTree = false) {

    // remove last remembered copied documents
    this.showDialog('Kopieren').pipe(
      switchMap(result => this.documentService.copy(
        // when copying a tree we don't need the children to be copied
        includeTree ? this.getSelectedDatasetsWithoutChildren() : this.getSelectedDatasets(),
        result.selection.parent,
        includeTree,
        this.forAddress))
    ).subscribe();

  }

  cut() {

    // remove last remembered copied documents
    this.showDialog('Verschieben').pipe(
      switchMap(result => this.documentService.move(this.getSelectedDatasetsWithoutChildren(), result.selection.parent, this.forAddress))
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
    );
  }

  private getSelectedDatasets() {
    return this.query.getActiveId().map(id => id.toString());
  }

  private getSelectedDatasetsWithoutChildren() {
    const selection = this.query.getActiveId()
      .map(id => id.toString());

    const filtered = selection
      .filter(id => !this.isChildOfSelectedParent(id, selection));
    console.log('Filtered datasets without children', filtered);
    return filtered;
  }

  unregister() {
    super.unregister();

    // remove from same index since buttons take the neighbor place after deletion
    this.toolbarService.removeButton('toolBtnCopy');
    this.toolbarService.removeButton('toolBtnCopyCutSeparator');
  }

  private isChildOfSelectedParent(id: string, selection: string[]): boolean {
    const parents = this.query.getParents(id);
    return parents.some(parent => selection.indexOf(parent) !== -1);
  }
}
