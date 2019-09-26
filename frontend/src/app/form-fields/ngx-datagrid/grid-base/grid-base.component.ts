import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  template: ''
})
export class GridBaseComponent implements OnInit {

  @Input() value: string | { value: string | number, label: string };
  @Output() update = new EventEmitter();
  @Output() tabkey = new EventEmitter();


  constructor() {
  }

  ngOnInit() {
  }

  updateValue(newValue: any) {
    // console.error('Function updateValue(value) must be implemented');
    if (this.value !== newValue) {
      this.update.next(newValue);
    }
  };

  sendTab($event: Event, value: string) {
    $event.preventDefault();
    this.updateValue(value);
    this.tabkey.next();
  }
}
