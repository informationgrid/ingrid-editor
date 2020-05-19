import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'ige-context-help',
  templateUrl: './context-help.component.html',
  styleUrls: ['./context-help.component.scss']
})
export class ContextHelpComponent implements OnInit {

  title: string;
  description$: Observable<String>;

  inExpandedView: boolean;

  constructor(public dialogRef: MatDialogRef<ContextHelpComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.title = this.data.title ? this.data.title : 'Kein Titel';
    this.description$ = this.data.description$ ? this.data.description$ : new BehaviorSubject("Keine Beschreibung");
    this.inExpandedView = false;
  }

  showMore() {
    this.dialogRef.updateSize('600px', 'auto');
    this.dialogRef.updatePosition({
      top: '50px'
    });
    this.inExpandedView = true;
  }
}
