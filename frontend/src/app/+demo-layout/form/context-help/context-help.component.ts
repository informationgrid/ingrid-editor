import {Component, ElementRef, Inject, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'ige-context-help',
  templateUrl: './context-help.component.html',
  styleUrls: ['./context-help.component.scss']
})
export class ContextHelpComponent implements OnInit {
  title: string;
  inExpandedView: boolean;
  @ViewChild('contextContent') contextContent: ElementRef;


  constructor(public dialogRef: MatDialogRef<ContextHelpComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.title = 'Beschreibung';
    this.inExpandedView = false;
      // this.dialogRef.updateSize('330px', '420px');
  }

  showMore() {
    this.dialogRef.updateSize('1000px', '800px');
    this.dialogRef.updatePosition({
      top: '50px'
    });
    this.inExpandedView = true;
    // this.contextContent.
  }
}
