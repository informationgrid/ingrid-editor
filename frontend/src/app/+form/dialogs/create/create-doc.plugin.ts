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
import {filter, first, take, tap} from 'rxjs/operators';
import {NgFormsManager} from "@ngneat/forms-manager";
import {
  ConfirmDialogButton,
  ConfirmDialogComponent,
  ConfirmDialogData
} from "../../../dialogs/confirm/confirm-dialog.component";
import {DocumentService} from "../../../services/document/document.service";
import {Observable} from "rxjs";

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
              private documentService: DocumentService,
              private messageService: MessageService,
              private formsManager: NgFormsManager,
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
    this.toolbarService.toolbarEvent$
      .pipe(untilDestroyed(this))
      .subscribe(eventId => {
        if (eventId === 'NEW_DOC') {
          this.newDoc();
        }
      });
  };

  async newDoc() {
    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;
    const selectedDoc = query.getOpenedDocument();


    if (selectedDoc) {

      const type = this.forAddress ? 'address' : 'document';
      const formHasChanged = this.formsManager.getControl(type)?.dirty;
      if (formHasChanged) {
        const form = this.formsManager.getControl(type).value
        const decision = await this.openSaveDialog().pipe(first()).toPromise()
        if (decision === 'save') {
          this.documentService.save(form, false, this.forAddress)
        } else if (decision === 'discard') {
          // TODO: refactor
          //  mark as untouched to prevent dirty dialog when opening newly created document
          // form.markAsPristine();
          // form.markAsUntouched();
          // FIXME: form does not seem to be updated automatically and we have to force update event
          //this.formsManager.upsert(type, form);
        } else {
          //decision is 'Abbrechen'
          return;
        }
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

  openSaveDialog(): Observable<any> {
    return this.dialog.open(ConfirmDialogComponent, {
      data: <ConfirmDialogData>{
        title: 'Änderungen sichern?',
        message: 'Es wurden Änderungen am aktuellen Dokument vorgenommen.\nMöchten Sie die Änderungen speichern?',
        buttons: [
          {id: "cancel", text: 'Abbrechen'},
          {id: "discard", text: 'Verwerfen', alignRight: true},
          {id: "save", text: 'Speichern', alignRight: true, emphasize: true}
        ]
      } as ConfirmDialogData
    }).afterClosed()
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
  }
}
