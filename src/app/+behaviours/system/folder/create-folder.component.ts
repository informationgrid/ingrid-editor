import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {Modal} from 'ngx-modal';
import {FormularService} from '../../../services/formular/formular.service';
import {StorageService} from '../../../services/storage/storage.service';
import {UpdateType} from '../../../models/update-type.enum';

@Component( {
  templateUrl: './create-folder.component.html'
} )
export class CreateFolderComponent implements OnInit {

  @ViewChild( 'createFolderModal' ) createFolderModal: Modal;
  @ViewChild( 'name' ) inputName: HTMLInputElement;

  folderName = '';
  parent = null;
  asSubFolder = false;

  private static createNewFolderDoc(folderName: string, parent?: string) {
    const data: any = {
      _profile: 'FOLDER',
      title: folderName
    };
    if (parent) {
      data._parent = parent;
    }
    return data;
  }

  constructor(private formService: FormularService, private storageService: StorageService, injector: Injector) {
    this.parent = injector.get('parent');
  }

  ngOnInit() {

    this.createFolderModal.open();
    // this.inputName.focus();

  }

  handleCreate() {
    console.log( 'name:', this.folderName );
    console.log( 'asSub:', this.asSubFolder );

    // if a name was entered
    if (this.folderName && this.folderName.trim().length > 0) {
      // store a new folder in the backend by calling storage service
      const parent = this.getParentForFolder();

      const folder = CreateFolderComponent.createNewFolderDoc(this.folderName, parent);

      // first send the information to tree that a new dataset is going to be created
      this.storageService.datasetsChanged.next({
        type: UpdateType.New,
        data: [folder]
      });

      // by saving the folder an update event is sent automatically to notify tree
      this.storageService.saveData(folder);
      this.createFolderModal.close();

    } else {
      // notify user to enter a title for the folder
    }
  }

  private getParentForFolder(): string {
    let parent = null;
    // if ...
    if (this.asSubFolder) {
      const selectedDocs = this.formService.getSelectedDocuments();
      if (selectedDocs.length === 1) {
        parent = selectedDocs[0].id;
      }
    }
    return parent;
  }
}
