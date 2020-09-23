import {Injectable} from '@angular/core';
import {FormToolbarService} from '../../form-shared/toolbar/form-toolbar.service';
import {Plugin} from '../../../+catalog/+behaviours/plugin';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';
import {CreateNodeComponent, CreateOptions} from './create-node.component';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {filter, take} from 'rxjs/operators';
import {FormUtils} from '../../form.utils';
import {DocumentService} from '../../../services/document/document.service';
import {NgFormsManager} from '@ngneat/forms-manager';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Injectable()
export class CreateFolderPlugin extends Plugin {
  id = 'plugin.folder';
  _name = 'Folder Plugin';

  eventCreateFolderId = 'CREATE_FOLDER';

  get name() {
    return this._name;
  }

  constructor(private formToolbarService: FormToolbarService,
              private treeQuery: TreeQuery,
              private addressTreeQuery: AddressTreeQuery,
              private documentService: DocumentService,
              private formsManager: NgFormsManager,
              private dialog: MatDialog) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    console.log('register folder plugin');
    // add button to toolbar for publish action
    this.formToolbarService.addButton({
      id: 'toolBtnFolder',
      tooltip: 'Ordner erstellen',
      matSvgVariable: 'outline-create_new_folder-24px',
      eventId: this.eventCreateFolderId,
      pos: 1,
      active: true
    });

    // add event handler for revert
    const toolbarEventSubscription = this.formToolbarService.toolbarEvent$
      .subscribe(eventId => {
        if (eventId === this.eventCreateFolderId) {
          this.createFolder();
        }
      });

    this.subscriptions.push(toolbarEventSubscription);
  }

  async createFolder() {
    // show dialog where user can choose name of the folder and location
    // it can be created under the root node or another folder
    // TODO: parent node determination is the same as in new-doc plugin
    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;
    const selectedDoc = query.getOpenedDocument();

    // wait for entity in store, otherwise it could happen that the tree is being
    // loaded while we clicked on the create node button. In this case the function
    // getFirstParentFolder would throw an error
    if (selectedDoc) {

      let handled = await FormUtils.handleDirtyForm(this.formsManager, this.documentService, this.dialog, this.forAddress);

      if (!handled) {
        return;
      }

      query.selectEntity(selectedDoc.id)
        .pipe(
          untilDestroyed(this),
          filter(entity => entity !== undefined),
          take(1)
        )
        .subscribe((entity) => {
          let parentDocId = null;
          const folder = query.getFirstParentFolder(selectedDoc.id.toString());
          if (folder !== null) {
            parentDocId = folder.id;
          }
          this.showDialog(parentDocId);
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
      // height: 'calc(100vh - 235px)',
      disableClose: true,
      data: {
        parent: parentDocId,
        forAddress: this.forAddress,
        isFolder: true
      } as CreateOptions
    });
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton('toolBtnFolder');
  }

}
