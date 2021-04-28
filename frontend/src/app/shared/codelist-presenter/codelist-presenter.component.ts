import {Component, OnInit, EventEmitter, Output, Input} from '@angular/core';
import {Codelist, CodelistEntry} from '../../store/codelist/codelist.model';

@Component({
  selector: 'ige-codelist-presenter',
  templateUrl: './codelist-presenter.component.html',
  styleUrls: ['./codelist-presenter.component.scss']
})
export class CodelistPresenterComponent implements OnInit {

  _codelist: Codelist;
  @Input() set codelist(value: Codelist) {
    this._codelist = value;
    if (value) {
      this.prepareEntryFields(value);
    }
  }

  @Input() hideMenu = false;

  @Output() remove = new EventEmitter<CodelistEntry>();
  @Output() setDefault = new EventEmitter<CodelistEntry>();
  @Output() edit = new EventEmitter<CodelistEntry>();

  showMore = {};
  entryFields: { [x: string]: string[][] } = {};

  constructor() {
  }

  ngOnInit(): void {
  }

  private prepareEntryFields(entry: Codelist) {
    entry.entries.forEach(entry => {
      this.entryFields[entry.id] = Object
        .keys(entry.fields)
        .map(key => [key, entry.fields[key]]);
    });
  }

}
