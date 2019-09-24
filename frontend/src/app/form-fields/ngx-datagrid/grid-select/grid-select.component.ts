import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ColumnOptions} from '../ngx-datagrid.component';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'ige-grid-select',
  templateUrl: './grid-select.component.html',
  styleUrls: ['./grid-select.component.scss']
})
export class GridSelectComponent implements OnInit, AfterViewInit {

  @Input() value: { value: string | number, label: string };
  @Output() update = new EventEmitter();
  @Output() tabkey = new EventEmitter();

  @Input() options: ColumnOptions[];

  @ViewChild('select', {static: true}) select: MatSelect;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // this.select.open();
      this.select.focus();
    });
  }

  updateValue(open: boolean, newValue: string) {
    console.log('update value select');
    if (!open) {
      const optionItem = this.options.find(o => o.value === newValue);
      if (optionItem) {
        this.update.next({
          value: newValue,
          label: optionItem.label
        });
      }
    }
  }

  sendTab($event: Event, value) {
    $event.preventDefault();
    this.updateValue(false, value);
    this.tabkey.next();
  }
}
