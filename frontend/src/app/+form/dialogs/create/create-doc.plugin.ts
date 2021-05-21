import {Injectable} from '@angular/core';
import {Plugin} from '../../../+catalog/+behaviours/plugin';
import {FormToolbarService} from '../../form-shared/toolbar/form-toolbar.service';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';
import {MessageService} from '../../../services/message.service';
import {FormularService} from '../../formular.service';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {CreateNodeComponent, CreateOptions} from './create-node.component';
import {filter, take} from 'rxjs/operators';
import {DocumentService} from "../../../services/document/document.service";
import {FormUtils} from "../../form.utils";
import {FormStateService} from "../../form-state.service";

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
  group = 'Toolbar';
  defaultActive = true;

  constructor(private toolbarService: FormToolbarService,
              private treeQuery: TreeQuery,
              private addressTreeQuery: AddressTreeQuery,
              private formularService: FormularService,
              private documentService: DocumentService,
              private messageService: MessageService,
              private formStateService: FormStateService,
              private dialog: MatDialog) {
    super();

  }

  get name() {
    return this._name;
  }

  register() {
    const buttons = [
      {
        id: 'toolBtnNew',
        tooltip: 'Neuen Datensatz erstellen',
        matSvgVariable: 'Neuer-Datensatz',
        eventId: 'NEW_DOC',
        pos: 10,
        active: true
      }
      // {id: 'toolBtnNewSeparator', pos: 15, isSeparator: true}
    ];
    buttons.forEach((button) => this.toolbarService.addButton(button));

    // add event handler for revert
    const toolbarEventSubscription = this.toolbarService.toolbarEvent$
      .subscribe(eventId => {
        if (eventId === 'NEW_DOC') {
          this.newDoc();
        }
      });

    this.subscriptions.push(toolbarEventSubscription);
  };

  async newDoc() {
    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;
    const selectedDoc = query.getOpenedDocument();


    if (selectedDoc) {

      let handled = await FormUtils.handleDirtyForm(this.formStateService.getForm(), this.documentService, this.dialog, this.forAddress);

      if (!handled) {
        return;
      }

      query.selectEntity(selectedDoc.id)
        .pipe(
          filter(entity => entity !== undefined),
          take(1)
        )
        .subscribe((entity) => {
          let selectedDocId = null;
          const folder = query.getFirstParentFolder(selectedDoc.id.toString());
          if (folder !== null) {
            selectedDocId = folder.id;
          }
          this.showDialog(selectedDocId);
        });
    } else {
      this.showDialog(null);
    }

  }

  showDialog(parentDocId: string) {
    this.dialog.open(CreateNodeComponent, {
      minWidth: 500,
      maxWidth: 600,
      minHeight: 400,
      disableClose: true,
      data:
        {
          parent: parentDocId,
          forAddress: this.forAddress,
          isFolder: false
        } as CreateOptions
    });
  }

  unregister() {
    super.unregister();

    this.toolbarService.removeButton('toolBtnNew');
  }
}
