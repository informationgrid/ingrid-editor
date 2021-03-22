import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { CodelistStore, CodelistState } from './codelist.store';
import { Codelist } from './codelist.model';

@Injectable({
  providedIn: 'root'
})
export class CodelistQuery extends QueryEntity<CodelistState, Codelist> {

  catalogCodelists$ = this.select(state => state.catalogCodelists);

  constructor(protected store: CodelistStore) {
    super(store);
  }

}
