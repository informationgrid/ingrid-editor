import { Component, Input, OnInit } from '@angular/core';
import { ViewCell } from 'ng2-smart-table';

@Component({
  template: `
    {{renderValue}}
  `,
})
export class SelectRenderComponent implements ViewCell, OnInit {

  renderValue: string;

  @Input() value: string | number;
  @Input() rowData: any;
  @Input() options: any[];

  ngOnInit() {
    const found = this.options.find( option => {
      return option.id === this.value;
    });
    this.renderValue = found.value;
  }

}
