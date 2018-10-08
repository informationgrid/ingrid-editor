import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ige-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css']
})
export class ExportComponent implements OnInit {

  selection: any[] = [];

  constructor() { }

  ngOnInit() {
  }

  handleSelected(nodes) {
    this.selection = nodes;
  }
}
