import {Injectable} from '@angular/core';
import {QueryEntity} from '@datorama/akita';
import {DocumentState, DocumentStore} from './document.store';
import {DocumentAbstract} from './document.model';
import {Observable} from "rxjs";
import {IgeDocument} from "../../models/ige-document";

@Injectable({
  providedIn: 'root'
})
export class DocumentQuery extends QueryEntity<DocumentState, DocumentAbstract> {

  openedDocument$: Observable<IgeDocument> = this.select(state => state.openedDocument);

  recentDocuments$: Observable<DocumentAbstract[]> = this.select(state => state.recent);

  constructor(protected store: DocumentStore) {
    super(store);
  }

}
