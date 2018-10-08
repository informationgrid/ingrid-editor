import { Component, Input, OnInit } from '@angular/core';
// import { ViewCell } from 'ng2-smart-table';

@Component({
  template: `
    {{renderValue}}
  `,
})
export class TitleRenderComponent implements OnInit {

  renderValue: string;

  @Input() value: string | number;
  @Input() rowData: any;

  ngOnInit() {
    this.renderValue = this.value[0]['label'];
  }

}
