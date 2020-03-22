import {Component, Inject, OnInit} from '@angular/core';
import {DocumentService} from '../../../services/document/document.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormularService} from '../../formular.service';
import {take} from "rxjs/operators";
import {TreeQuery} from "../../../store/tree/tree.query";
import {AddressTreeQuery} from "../../../store/address-tree/address-tree.query";
import {TreeNode} from "../../../store/tree/tree-node.model";
import {DocumentAbstract} from "../../../store/document/document.model";
import {of, Subject} from "rxjs";

@Component({
  templateUrl: './create-folder.component.html',
  styleUrls: ['./create-folder.component.scss']
})
export class CreateFolderComponent implements OnInit {

  parent: string = null;
  forAddress: boolean;
  path: string[] = [];
  selectedPage = 0;
  rootNode: Partial<DocumentAbstract>;

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
              private treeQuery: TreeQuery, private addressTreeQuery: AddressTreeQuery,
              public dialogRef: MatDialogRef<CreateFolderComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.parent = data.parent;

  }

  ngOnInit() {
    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;

    query.pathTitles$
      .pipe(
        take(1) // TODO: check if correctly unsubsribed
      )
      .subscribe(path => {
        const selectedNode = query.getOpenedDocument();
        if (selectedNode && selectedNode._profile !== 'FOLDER') {
          this.path = [...path];
          this.path.pop();
        } else {
          this.path = path;
        }
      });
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

  updateParent(parentInfo: any) {
    this.parent = parentInfo.parent;
    this.path = parentInfo.path;
  }
}
