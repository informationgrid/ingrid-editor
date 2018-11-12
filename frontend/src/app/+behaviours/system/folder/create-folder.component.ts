import { Component, Inject, OnInit } from '@angular/core';
import { FormularService } from '../../../services/formular/formular.service';
import { DocumentService } from '../../../services/document/document.service';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component( {
  templateUrl: './create-folder.component.html'
} )
export class CreateFolderComponent implements OnInit {

  parent: any = null;
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

  constructor(private formService: FormularService,
              private storageService: DocumentService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.parent = data.parent;
  }

  ngOnInit() {
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
      this.storageService.save(folder, true);

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
