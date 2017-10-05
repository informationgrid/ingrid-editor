import {ComponentFactoryResolver, Injectable, ReflectiveInjector, ValueProvider} from '@angular/core';
import {FormToolbarService} from '../../../+form/toolbar/form-toolbar.service';
import {FormularService} from '../../../services/formular/formular.service';
import {ModalService} from '../../../services/modal/modal.service';
import {StorageService} from '../../../services/storage/storage.service';
import {Plugin} from '../../plugin';
import {CreateFolderComponent} from './create-folder.component';
import {SelectedDocument} from '../../../+form/sidebars/selected-document.model';

@Injectable()
export class FolderPlugin extends Plugin {
  id = 'plugin.folder';
  _name = 'Folder Plugin';

  eventCreateFolderId = 'CREATE_FOLDER';

  get name() {
    return this._name;
  }

  constructor(private formToolbarService: FormToolbarService,
              private formService: FormularService,
              private modalService: ModalService,
              private _cr: ComponentFactoryResolver) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    console.log( 'register folder plugin' );
    // add button to toolbar for publish action
    this.formToolbarService.addButton( {
      id: 'toolBtnFolder',
      tooltip: 'Create Folder',
      cssClasses: 'fa fa-folder-o',
      eventId: this.eventCreateFolderId,
      active: true
    }, 1 );

    // add event handler for revert
    this.formToolbarService.toolbarEvent$.subscribe( eventId => {
      if (eventId === this.eventCreateFolderId) {
        this.createFolder();
      }
    } );

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
    // let formData = this.formService.requestFormValues();
    // if (formData.form) {
    //
    // }

    // show dialog where user can choose name of the folder and location
    // it can be created under the root node or another folder
    const parents = this.formService.getSelectedDocuments();
    const factory = this._cr.resolveComponentFactory( CreateFolderComponent );

    const providers = ReflectiveInjector.resolve( [
      <ValueProvider>{provide: 'parent', useValue: parents ? parents[0] : null}
    ] );
    const popInjector = ReflectiveInjector.fromResolvedProviders( providers, this.modalService.containerRef.parentInjector );
    this.modalService.containerRef.createComponent( factory, null, popInjector );
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton( 'toolBtnFolder' );
  }

  /**
   * When a dataset is loaded or changed then notify the toolbar to enable/disable button state.
   */
  private addBehaviour() {
    /*const handleButtonState = (data: SelectedDocument) => {
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
