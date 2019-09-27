import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {GridBaseComponent} from '../grid-base/grid-base.component';
import {MatInput} from '@angular/material/input';

@Component({
  selector: 'ige-grid-date',
  templateUrl: './grid-date.component.html',
  styleUrls: ['./grid-date.component.scss']
})
export class GridDateComponent extends GridBaseComponent implements OnInit {

  @ViewChild('input', {static: true}) date: MatInput;
  inputDate: string;

  constructor() {
    super();
  }

  ngOnInit() {
    this.inputDate = (<Date>this.value).toString();
  }

  updateInputValue(newValue: string, $event: Event) {
    console.log('Event', $event);
    // if ($event.pageX) {}
    // if (!checkIfChanged || newValue !== this.inputDate ) {
      // super.updateValue(newValue ? new Date(newValue) : null);
    // }
  }

  updateValue(newValue: Date) {
    super.updateValue(newValue);
  };

  log() {
    console.log('click');
  }
}
