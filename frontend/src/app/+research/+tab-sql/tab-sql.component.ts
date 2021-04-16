import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';

@Component({
  selector: 'ige-tab-sql',
  templateUrl: './tab-sql.component.html',
  styleUrls: ['./tab-sql.component.scss']
})
export class TabSqlComponent implements OnInit {

  _sql: string;
  @Input()
  set sqlValue(value: string) {
    this._sql = value;
    if (value) {
      this.query.emit(value);
    }
  }
  get sqlValue() {
    return this._sql;
  }

  @Output() query = new EventEmitter();


  constructor() { }

  ngOnInit(): void {
  }

}
