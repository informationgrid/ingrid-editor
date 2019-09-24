import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'ige-grid-base',
  templateUrl: './grid-base.component.html',
  styleUrls: ['./grid-base.component.scss']
})
export abstract class GridBaseComponent implements OnInit {

  @Input() value: string | { value: string | number, label: string };
  @Output() update = new EventEmitter();
  @Output() tabkey = new EventEmitter();

  abstract updateValue($event);

  constructor() {
  }

  ngOnInit() {
  }

  sendTab($event: Event, value: string) {
    $event.preventDefault();
    this.updateValue(value);
    this.tabkey.next();
  }
}
