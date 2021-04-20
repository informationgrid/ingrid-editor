import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {QueryQuery} from '../../store/query/query.query';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'ige-tab-sql',
  templateUrl: './tab-sql.component.html',
  styleUrls: ['./tab-sql.component.scss']
})
export class TabSqlComponent implements OnInit {

  sql: string;

  @Output() query = new EventEmitter();


  constructor(private queryQuery: QueryQuery) {
  }

  ngOnInit(): void {
    // init to last session state
    const state = this.queryQuery.getValue().ui.sql;
    this.sql = state.query;

    this.queryQuery.sqlSelect$
      .pipe(untilDestroyed(this))
      .subscribe(state => {
        this.sql = state.query;
      });
  }

}
