import {Injectable} from '@angular/core';
import {Plugin} from '../../../+behaviours/plugin';
import {FormToolbarService} from '../../form-shared/toolbar/form-toolbar.service';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';
import {NewDocumentComponent} from './new-document.component';
import {MessageService} from '../../../services/message.service';
import {FormularService} from '../../formular.service';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

export type DocType = { id: string, label: string, icon: string };

@UntilDestroy()
@Injectable()
export class NewDocumentPlugin extends Plugin {
  id = 'plugin.newDoc';
  _name = 'Neues Dokument Plugin';
  defaultActive = true;

  constructor(private toolbarService: FormToolbarService,
              private treeQuery: TreeQuery,
              private addressTreeQuery: AddressTreeQuery,
              private formularService: FormularService,
              private messageService: MessageService,
              private dialog: MatDialog) {
    super();

  }

  get name() {
    return this._name;
  }

  register() {
    this.toolbarService.addButton(
      {id: 'toolBtnNew', tooltip: 'New', matSvgVariable: 'Neuer-Datensatz', eventId: 'NEW_DOC', pos: 10, active: true}
    );

    // add event handler for revert
    this.toolbarService.toolbarEvent$
      .pipe(untilDestroyed(this))
      .subscribe(eventId => {
      if (eventId === 'NEW_DOC') {
        this.newDoc();
      }
    });
  };

  newDoc() {
    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;
    const selectedDoc = query.getOpenedDocument();
    let selectedDocId = null;
    if (selectedDoc) {
      const folder = query.getFirstParentFolder(selectedDoc.id.toString());
      if (folder !== null) {
        selectedDocId = folder.id;
      }
    }

    this.dialog.open(NewDocumentComponent, {
      minWidth: 500,
      minHeight: 400,
      disableClose: true,
      data:
        {
          rootOption: true,
          parent: selectedDocId,
          choice: null,
          forAddress: this.forAddress
        }
    });

  }

  unregister() {
    super.unregister();
  }
}
