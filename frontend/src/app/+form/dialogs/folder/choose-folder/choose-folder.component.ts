import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {PasteDialogComponent, PasteDialogOptions} from '../../copy-cut-paste/paste-dialog.component';
import {TreeNode} from '../../../../store/tree/tree-node.model';

@Component({
  selector: 'ige-choose-folder',
  templateUrl: './choose-folder.component.html',
  styleUrls: ['./choose-folder.component.scss']
})
export class ChooseFolderComponent implements OnInit {

  @Output() update = new EventEmitter();

  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
  }

  chooseDirectory() {
    this.dialog.open(PasteDialogComponent, {
      data: {
        titleText: 'Auswählen',
        buttonText: 'Auswählen',
        disabledCondition: (node: TreeNode) => {
          return node.profile !== 'FOLDER';
        }
      } as PasteDialogOptions
    }).afterClosed().subscribe(result => {
      if (result) {
        this.update.next(result);
      }
    });
  }
}
