import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/material';
import {MatDialog} from '@angular/material/dialog';
import {MetadataTreeComponent} from '../../+form/sidebars/tree/tree.component';
import {TreeQuery} from '../../store/tree/tree.query';
import {map} from 'rxjs/operators';
import {SidebarComponent} from '../../+form/sidebars/sidebar.component';
import {TreeSelectDialog} from '../../dialogs/form/tree-select.dialog';

@Component({
  selector: 'formly-docreference-type',
  template: `
    <mat-list>
      <mat-list-item *ngFor="let doc of docs">
        <mat-icon mat-list-icon>folder</mat-icon>
        <h4 mat-line>{{doc.title}}</h4>
        <p mat-line> {{doc.type}} </p>
        <button mat-icon-button (click)="remove(doc)">
          <mat-icon class="action-button">edit</mat-icon>
        </button>
        <button mat-icon-button (click)="remove(doc)">
          <mat-icon class="action-button">delete</mat-icon>
        </button>
      </mat-list-item>
    </mat-list>

    <button mat-flat-button (click)="showTree()">Add</button>
  `,
  styles: [`
    .action-button {
      font-size: initial;
    }
    .action-button:hover {
      font-size: medium;
    }
  `]
})
export class DocReferenceTypeComponent extends FieldType implements OnInit, AfterViewInit {
  docs = [];

  constructor(private dialog: MatDialog, private treeQuery: TreeQuery) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  showTree() {
    this.dialog.open(TreeSelectDialog, {
      data: {
        data: this.treeQuery.selectAll().pipe(
          map(docs => docs.map(SidebarComponent.mapDocToTreeNode))
        )
      }
    }).afterClosed().subscribe(result => {
      console.log('Tree dialog result', result);
      this.docs.push({
        title: result[0],
        type: 'Address?'
      });
    });
  }

  remove(doc: any) {

  }
}
