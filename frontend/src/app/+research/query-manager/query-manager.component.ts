import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {QueryQuery} from '../../store/query/query.query';

@Component({
  selector: 'ige-query-manager',
  templateUrl: './query-manager.component.html',
  styleUrls: ['./query-manager.component.scss']
})
export class QueryManagerComponent implements OnInit {

  @Output() selection = new EventEmitter<string>();


  systemQueries = this.queryQuery.selectAll();

  userQueries = [];

  constructor(private queryQuery: QueryQuery) {
  }

  ngOnInit(): void {
  }

  removeQuery(id: string, $event: MouseEvent) {
    // $event.stopPropagation();
    // $event.stopImmediatePropagation();
  }

  load(id: string) {
    this.selection.emit(id);
  }
}
