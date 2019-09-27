import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ColumnOptions} from '../ngx-datagrid.component';
import {MatSelect} from '@angular/material/select';
import {GridBaseComponent} from '../grid-base/grid-base.component';

interface SelectUpdate {
  isOpen: boolean;
  newValue: string;
}

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

  updateValue(selectUpdate: SelectUpdate) {
    console.log('update value select', selectUpdate);
    if (selectUpdate && !selectUpdate.isOpen) {
      console.log('Options', selectUpdate);
      if (selectUpdate.newValue === undefined) {
        this.update.next(undefined);
      } else {
        const optionItem = this.options.find(o => o.value === selectUpdate.newValue);
        if (optionItem) {
          this.update.next({
            value: selectUpdate.newValue,
            label: optionItem.label
          });
        }
      }
    }
  }
}
