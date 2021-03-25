import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ige-save-query-dialog',
  templateUrl: './save-query-dialog.component.html',
  styleUrls: ['./save-query-dialog.component.scss']
})
export class SaveQueryDialogComponent implements OnInit {

  model: any = {};

  constructor() { }

  ngOnInit(): void {
  }

}
