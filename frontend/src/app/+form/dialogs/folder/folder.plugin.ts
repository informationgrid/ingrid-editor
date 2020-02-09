import {ComponentFactoryResolver, Injectable} from '@angular/core';
import {FormToolbarService} from '../../toolbar/form-toolbar.service';
import {ModalService} from '../../../services/modal/modal.service';
import {Plugin} from '../../../+behaviours/plugin';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';
import {CreateFolderComponent} from './create-folder.component';

@Injectable()
export class FolderPlugin extends Plugin {
  id = 'plugin.folder';
  _name = 'Folder Plugin';

  eventCreateFolderId = 'CREATE_FOLDER';

  get name() {
    return this._name;
  }

  constructor(private formToolbarService: FormToolbarService,
              private treeQuery: TreeQuery,
              private modalService: ModalService,
              private dialog: MatDialog,
              private _cr: ComponentFactoryResolver) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    console.log('register folder plugin');
    // add button to toolbar for publish action
    this.formToolbarService.addButton({
      id: 'toolBtnFolder',
      tooltip: 'Create Folder',
      matIconVariable: 'create_new_folder',
      eventId: this.eventCreateFolderId,
      pos: 1,
      active: true
    });

    // add event handler for revert
    this.formToolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === this.eventCreateFolderId) {
        this.createFolder();
      }
    });

    // add behaviour to set active states for toolbar buttons
    this.addBehaviour();

    // add action for button
    // -> add field to document tagging publish state

    // how to display document that it is published or not?
    // -> tree, symbol in formular, which works in all kinds of formulars
    // -> or make view flexible which can be overridden

    // add hook to attach to when action is triggered
  }

  createFolder() {
    // show dialog where user can choose name of the folder and location
    // it can be created under the root node or another folder
    // const parents = this.formService.getSelectedDocuments();
    const parents = this.treeQuery.getActive();

    this.dialog.open(CreateFolderComponent, {
      minWidth: 500,
      data: { parent: parents && parents[0] ? parents[0].id : null }
    });
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton('toolBtnFolder');
  }

  /**
   * When a dataset is loaded or changed then notify the toolbar to enable/disable button state.
   */
  private addBehaviour() {
    /*const handleButtonState = (data: DocumentAbstract) => {
      if (!data || data.profile === 'FOLDER') {
        this.formToolbarService.setButtonState( 'toolBtnFolder', true );
      } else {
        this.formToolbarService.setButtonState( 'toolBtnFolder', false );

      }
    };*/

    // this.storageService.datasetsChanged$.subscribe( (data: any) => {
    //   handleButtonState(data);
    // });

    /*this.formService.selectedDocuments$.subscribe( data => {
      if (data.length === 1) {
        // handleButtonState( data[0] );
        this.formToolbarService.setButtonState( 'toolBtnFolder', true );
      } else {
        this.formToolbarService.setButtonState( 'toolBtnFolder', false );
      }
    } );*/
  }
}
