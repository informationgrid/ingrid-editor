import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';

@Component({
  selector: 'ige-context-help',
  templateUrl: './context-help.component.html',
  styleUrls: ['./context-help.component.scss']
})
export class ContextHelpComponent implements OnInit {

  title: string;
  description$: Observable<String> = this.data.description$;
  
  //inExpandedView: boolean;

  constructor(public dialogRef: MatDialogRef<ContextHelpComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    /*
    setTimeout(()=>{
      let contentWidth = document.getElementsByClassName('mat-dialog-content')[0].clientWidth;
      let contentHeight = document.getElementsByClassName('mat-dialog-content')[0].clientHeight + 34;
      this.dialogRef.updateSize(contentWidth + 'px', contentHeight + 'px');
    }, 200);
    */
    this.title = this.data.title ? this.data.title : 'Kein Titel';
    //this.inExpandedView = false;
  }
/*
  showMore() {

    this.dialogRef.updateSize('600px', 'auto');
    this.dialogRef.updatePosition({
      top: '50px'
    });
    this.inExpandedView = true;

  }
*/
}
