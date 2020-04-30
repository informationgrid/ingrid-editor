import {Injectable} from '@angular/core';
import {Plugin} from '../../../+behaviours/plugin';
import {FormToolbarService} from '../../form-shared/toolbar/form-toolbar.service';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';
import {MessageService} from '../../../services/message.service';
import {FormularService} from '../../formular.service';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {CreateNodeComponent, CreateOptions} from './create-node.component';
import {filter, take} from 'rxjs/operators';

export interface DocType {
  id: string,
  label: string,
  icon: string
}

@UntilDestroy()
@Injectable()
export class CreateDocumentPlugin extends Plugin {
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
    const buttons = [
      {id: 'toolBtnNew', tooltip: 'Neuen Datensatz erstellen', matSvgVariable: 'Neuer-Datensatz', eventId: 'NEW_DOC', pos: 10, active: true},
      {id: 'toolBtnNewSeparator', pos: 15, isSeparator: true}
    ];
    buttons.forEach((button) => this.toolbarService.addButton(button));

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

    query.selectEntity(selectedDoc.id)
      .pipe(
        filter(entity => entity !== undefined),
        take(1)
      )
      .subscribe((entity) => {

        let selectedDocId = null;
        if (selectedDoc) {
          const folder = query.getFirstParentFolder(selectedDoc.id.toString());
          if (folder !== null) {
            selectedDocId = folder.id;
          }
        }

        this.dialog.open(CreateNodeComponent, {
          minWidth: 500,
          minHeight: 400,
          disableClose: true,
          data:
            {
              parent: selectedDocId,
              forAddress: this.forAddress,
              isFolder: false
            } as CreateOptions
        });
      });
  }

  unregister() {
    super.unregister();
  }
}
