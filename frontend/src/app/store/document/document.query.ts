import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { DocumentStore, DocumentState } from './document.store';
import { DocumentAbstract } from './document.model';
import {Observable} from "rxjs";
import {IgeDocument} from "../../models/ige-document";

@Injectable({
  providedIn: 'root'
})
export class DocumentQuery extends QueryEntity<DocumentState, DocumentAbstract> {

  openedDocument$: Observable<IgeDocument> = this.select(state => state.openedDocument);

  selectedDocuments$: Observable<DocumentAbstract[]> = this.select(state => state.selected);

  recentDocuments$: Observable<DocumentAbstract[]> = this.select(state => state.recent);

  constructor(protected store: DocumentStore) {
    super(store);
  }

  get selectedDocuments(): DocumentAbstract[] {
    return this.getSnapshot().selected;
  }

}
