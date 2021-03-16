import {Injectable} from '@angular/core';
import {EntityState, EntityStore, StoreConfig} from '@datorama/akita';
import {Query} from './query.model';

export interface QueryState extends EntityState<Query> {
}

@Injectable({providedIn: 'root'})
@StoreConfig({name: 'query'})
export class QueryStore extends EntityStore<QueryState, Query> {

  constructor() {
    super();
  }

}
