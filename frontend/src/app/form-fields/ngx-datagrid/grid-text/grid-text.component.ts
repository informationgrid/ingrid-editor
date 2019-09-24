import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'ige-grid-text',
  templateUrl: './grid-text.component.html',
  styleUrls: ['./grid-text.component.scss']
})
export class GridTextComponent implements OnInit {

  @Input() value: string;
  @Output() update = new EventEmitter();
  @Output() tabkey = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  updateValue(event: Event) {
    const newValue = (<HTMLInputElement>event.target).value;

    if (this.value !== newValue) {
      this.update.next(newValue);
    }
  }

  sendTab($event: Event) {
    $event.preventDefault();
    this.updateValue($event);
    this.tabkey.next();
  }
}
