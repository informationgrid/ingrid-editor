import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'ige-context-help',
  templateUrl: './context-help.component.html',
  styleUrls: ['./context-help.component.css']
})
export class ContextHelpComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ContextHelpComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  showMore() {
    this.dialogRef.updateSize('1000px', '800px');
    this.dialogRef.updatePosition({
      top: '50px'
    });
  }
}
