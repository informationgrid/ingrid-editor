import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {PasteDialogComponent, PasteDialogOptions} from '../../copy-cut-paste/paste-dialog.component';
import {TreeNode} from '../../../../store/tree/tree-node.model';
import {TreeQuery} from '../../../../store/tree/tree.query';
import {take} from 'rxjs/operators';
import {AddressTreeQuery} from '../../../../store/address-tree/address-tree.query';

@Component({
  selector: 'ige-choose-folder',
  templateUrl: './choose-folder.component.html',
  styleUrls: ['./choose-folder.component.scss']
})
export class ChooseFolderComponent implements OnInit {

  @Input() forAddress: boolean;
  @Output() update = new EventEmitter();
  path: string[] = [];

  constructor(private dialog: MatDialog, private treeQuery: TreeQuery, private addressTreeQuery: AddressTreeQuery) {
  }

  ngOnInit() {
    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;

    query.pathTitles$
      .pipe(
        take(1) // TODO: check if correctly unsubsribed
      )
      .subscribe(path => {
        const selectedNode = query.getOpenedDocument();
        if (selectedNode) {
          if (selectedNode._profile === 'FOLDER') {
            this.path = [...path, selectedNode.title];
          } else {
            this.path = path;
          }
        }
      });
  }

  chooseDirectory() {
    this.dialog.open(PasteDialogComponent, {
      minWidth: 500,
      data: {
        titleText: 'Auswählen',
        buttonText: 'Auswählen',
        disabledCondition: (node: TreeNode) => {
          return node.profile !== 'FOLDER';
        },
        forAddress: this.forAddress
      } as PasteDialogOptions
    }).afterClosed().subscribe(result => {
      if (result) {
        this.path = result.path;
        this.update.next(result.selection[0]);
      }
    });
  }
}
