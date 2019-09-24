import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ColumnOptions} from '../ngx-datagrid.component';
import {MatSelect} from '@angular/material/select';
import {GridBaseComponent} from '../grid-base/grid-base.component';

@Component({
  selector: 'ige-grid-select',
  templateUrl: './grid-select.component.html',
  styleUrls: ['./grid-select.component.scss']
})
export class GridSelectComponent extends GridBaseComponent implements OnInit, AfterViewInit {

  @Input() options: ColumnOptions[];

  @ViewChild('select', {static: true}) select: MatSelect;

  constructor() {
    super();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // this.select.open();
      this.select.focus();
    });
  }

  updateValue(newValue: string) {
    console.log('update value select');
    // if (!open) {
      const optionItem = this.options.find(o => o.value === newValue);
      if (optionItem) {
        this.update.next({
          value: newValue,
          label: optionItem.label
        });
      // }
    }
  }
}
