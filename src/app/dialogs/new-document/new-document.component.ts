import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component( {
  selector: 'ige-new-document',
  templateUrl: './new-document.component.html',
  styleUrls: ['./new-document.component.css']
} )
export class NewDocumentComponent implements OnInit {

  result: any = {};

  constructor(
    public dialogRef: MatDialogRef<NewDocumentComponent>,
    @Inject( MAT_DIALOG_DATA ) public data: any) {
  }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }
}
