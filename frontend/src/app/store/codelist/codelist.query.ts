import {Injectable} from '@angular/core';
import {QueryEntity} from '@datorama/akita';
import {CodelistState, CodelistStore} from './codelist.store';
import {Codelist} from './codelist.model';
import {filter, first, map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CodelistQuery extends QueryEntity<CodelistState, Codelist> {

  catalogCodelists$ = this.select(state => state.catalogCodelists);
  hasCatalogCodelists$ = this.select(state => state.catalogCodelists).pipe(
    map(codelists => codelists.length > 0)
  );

  constructor(protected store: CodelistStore) {
    super(store);
  }

  selectCatalogCodelist(id: string): Observable<Codelist> {
    return this.select(state => state.catalogCodelists).pipe(
      map(codelists => codelists.filter(cl => cl.id === id)[0])
    );
  }

}
