import {Component, Injector, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormularService} from '../../../services/formular/formular.service';
import {StorageService} from '../../../services/storage/storage.service';
import {UpdateType} from '../../../models/update-type.enum';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';

@Component( {
  templateUrl: './create-folder.component.html'
} )
export class CreateFolderComponent implements OnInit {

  @ViewChild( 'createFolderModal' ) createFolderModal: TemplateRef<any>;
  @ViewChild( 'name' ) inputName: HTMLInputElement;

  parent: any = null;
  asSubFolder = false;
  private createFolderModalRef: BsModalRef;

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

  constructor(private modalService: BsModalService, private formService: FormularService,
              private storageService: StorageService, injector: Injector) {
    const parent = injector.get('parent');
    this.parent = parent ? parent : {};
  }

  ngOnInit() {
    setTimeout( () => this.createFolderModalRef = this.modalService.show(this.createFolderModal) );
  }

  handleCreate(value: string) {
    console.log( 'name:', value );
    console.log( 'asSub:', this.asSubFolder );

    // if a name was entered
    if (value && value.trim().length > 0) {
      // store a new folder in the backend by calling storage service
      const parent = this.getParentForFolder();

      const folder = CreateFolderComponent.createNewFolderDoc(value, parent);

      // by saving the folder an update event is sent automatically to notify tree
      this.storageService.saveData(folder, true);
      this.createFolderModalRef.hide();

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
