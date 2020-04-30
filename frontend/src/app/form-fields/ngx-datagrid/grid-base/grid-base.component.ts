import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  template: ''
})
export class GridBaseComponent implements OnInit {

  @Input() value: any; // string | Date | { value: string | number, label: string };
  @Output() update = new EventEmitter();
  @Output() tabkey = new EventEmitter();


  constructor() {
  }

  ngOnInit() {
  }

  updateValue(newValue: any) {
    // if (this.value !== newValue) {
    this.update.next(newValue);
    // }
  };

  sendTab($event: Event, value: any) {
    $event.preventDefault();
    this.updateValue(value);
    this.tabkey.next();
  }
}
