import {Injectable, OnDestroy} from '@angular/core';
import {Plugin} from '../../../+behaviours/plugin';
import {FormToolbarService} from '../../form-shared/toolbar/form-toolbar.service';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';
import {CreateDocOptions, NewDocumentComponent} from '../new-document/new-document.component';
import {IgeDocument} from '../../../models/ige-document';
import {HttpErrorResponse} from '@angular/common/http';
import {DocumentService} from '../../../services/document/document.service';
import {MessageService} from '../../../services/message.service';
import {FormularService} from '../../formular.service';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';

@Injectable()
export class NewDocumentPlugin extends Plugin implements OnDestroy {
  id = 'plugin.newDoc';
  _name = 'Neues Dokument Plugin';
  defaultActive = true;

  // choice of doc types to be shown when creating new document
  newDocOptions: any = {
    docTypes: [],
    selectedDataset: {},
    rootOption: true
  };

  constructor(private toolbarService: FormToolbarService,
              private treeQuery: TreeQuery,
              private addressTreeQuery: AddressTreeQuery,
              private formularService: FormularService,
              private documentService: DocumentService,
              private messageService: MessageService,
              private dialog: MatDialog) {
    super();
  }

  ngOnDestroy(): void {
  }

  get name() {
    return this._name;
  }

  register() {
    this.toolbarService.addButton(
    {id: 'toolBtnNew', tooltip: 'New', matSvgVariable: 'Neuer-Datensatz', eventId: 'NEW_DOC', pos: 10, active: true}
    );

    // add event handler for revert
    this.toolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'NEW_DOC') {
        this.newDoc();
      }
    });
  };

  newDoc() {
    // let options = {
    //   availableTypes: this.formularService.docTypes,
    //   rootOption: true
    // };
    const selectedDocs = this.forAddress ? this.addressTreeQuery.getActive() : this.treeQuery.getActive();
    this.newDocOptions.docTypes = this.getDocTypes()
      .filter(type => type.id !== 'FOLDER')
      .sort((a, b) => a.label.localeCompare(b.label));

    this.newDocOptions.selectedDataset = (selectedDocs && selectedDocs.length === 1) ? selectedDocs[0] : {};

    const dlg = this.dialog.open(NewDocumentComponent, {
      minWidth: 500,
      data:
        {
          docTypes: this.newDocOptions.docTypes,
          rootOption: this.newDocOptions.rootOption,
          parent: this.newDocOptions.selectedDataset.id,
          choice: null,
          forAddress: this.forAddress
        }
    });
    dlg.afterClosed().subscribe((result: CreateDocOptions) => {
      if (result) {
        this.saveNewDocument(result);
      }
    })
  }

  /**
   * Create a new document and save it in the backend.
   * @param options
   */
  saveNewDocument(options: CreateDocOptions) {

    const newDoc = new IgeDocument(options.choice, options.parent);
    newDoc.title = options.title;

    this.saveForm(newDoc);

  }

  private saveForm(data: IgeDocument) {
    this.documentService.save(data, true, this.forAddress).then(() => {
      this.messageService.sendInfo('Ihre Eingabe wurde gespeichert');
    }, (err: HttpErrorResponse) => {
      throw err;
    });
  }

  // TODO: init once and use value instead of calculation
  getDocTypes(): { id: string, label: string }[] {
    return this.formularService.profileDefinitions.map(profile => ({id: profile.id, label: profile.label}));
  }

  unregister() {
    super.unregister();
  }
}
