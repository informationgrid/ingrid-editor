import { Component, Inject, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {DocumentService} from '../../../services/document/document.service';
import {Router} from '@angular/router';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material';

@Component({
  template: `
    <h2 mat-dialog-title>Löschen</h2>
    <mat-dialog-content>
      <p>Möchten Sie wirklich diese Datensätze löschen:</p>
      <ul>
        <li *ngFor="let doc of docsToDelete">{{doc.label}}</li>
      </ul>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]>Abbrechen</button>
      <button mat-button [mat-dialog-close] (click)="doDelete()">Löschen</button>
    </mat-dialog-actions>
  `
})
export class DeleteDialogComponent implements OnInit {

  constructor(private storageService: DocumentService,
              private router: Router, @Inject(MAT_DIALOG_DATA) public docsToDelete: any[]) {
  }

  ngOnInit() {
  }

  doDelete() {
    try {
      const ids = this.docsToDelete.map(doc => doc.id);
      this.storageService.delete(ids);

      // clear form if we removed the currently opened doc
      // and change route in case we try to reload page which would load the deleted document
      // if (this.data._id === ids[0]) {
      //   this.form = null;
        // TODO: use constant for no document selected
        this.router.navigate( ['/form']);
      // }
    } catch (ex) {
      console.error( 'Could not delete', ex );
    }
  }
}
