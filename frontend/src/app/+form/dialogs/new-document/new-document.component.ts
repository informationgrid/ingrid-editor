import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface CreateDocOptions {
  choice?: string;
  addBelowDoc?: boolean;
}

@Component({
  selector: 'ige-new-document',
  templateUrl: './new-document.component.html',
  styleUrls: ['./new-document.component.css']
})
export class NewDocumentComponent implements OnInit {

  result: CreateDocOptions = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    // select first/default document type
    this.result.choice = this.data.docTypes[0].id;
  }
}
