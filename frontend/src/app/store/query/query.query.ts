import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { QueryStore, QueryState } from './query.store';
import {Query} from './query.model';

@Injectable({ providedIn: 'root' })
export class QueryQuery extends QueryEntity<QueryState, Query> {

  searchSelect$ = this.select(state => state.ui.search);
  sqlSelect$ = this.select(state => state.ui.sql);

  constructor(protected store: QueryStore) {
    super(store);
  }

}
