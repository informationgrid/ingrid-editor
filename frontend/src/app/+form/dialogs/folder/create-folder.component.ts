import {Component, Inject, OnInit} from '@angular/core';
import {DocumentService} from '../../../services/document/document.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormularService} from '../../formular.service';

@Component({
  templateUrl: './create-folder.component.html',
  styles: [`
    .mat-dialog-content {
      padding-bottom: 10px;
    }

    .mat-form-field {
      width: 100%;
    }
  `]
})
export class CreateFolderComponent implements OnInit {

  parent: string = null;
  private forAddress: boolean;

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
              public dialogRef: MatDialogRef<CreateFolderComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.parent = data.parent;
    this.forAddress = data.forAddress;
  }

  ngOnInit() {
  }

  handleCreate(value: string) {
    console.log('name:', value);

    // if a name was entered
    if (value && value.trim().length > 0) {
      // store a new folder in the backend by calling storage service
      const folder = CreateFolderComponent.createNewFolderDoc(value, this.parent);

      // by saving the folder an update event is sent automatically to notify tree
      this.storageService.save(folder, true, this.forAddress);

      this.dialogRef.close();
    }
  }

  setDestination(destination: string) {
    console.log('Destination: ' + destination);
    this.parent = destination;
  }
}
