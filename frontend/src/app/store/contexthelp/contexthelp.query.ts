import {Injectable} from '@angular/core';
import {QueryEntity} from '@datorama/akita';
import {ContexthelpState, ContexthelpStore} from './contexthelp.store';
import {ContexthelpAbstract} from './contexthelp.model';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ContexthelpQuery extends QueryEntity<ContexthelpState, ContexthelpAbstract> {

  isInitialized$ = this.select(store => store.isInitialized);

  constructor(protected store: ContexthelpStore) {
    super(store);
  }

  getAvailableHelpFieldIds(profile: string, docType: string): String[] {
    return this.getAll().filter(h => h.docType == docType && h.profile == profile).map(h => h.fieldId);
  }

  availableHelpFieldIds(profile: string, docType: string): Observable<String[]> {
    return this.selectAll().pipe(map(all => all.filter(h => h.docType == docType && h.profile == profile).map(h => h.fieldId)));
  }

  getContexthelp(profile: string, docType: string, fieldId: string): ContexthelpAbstract {
    return this.getEntity([profile, docType, fieldId].join(','));
  }

  contexthelp(profile: string, docType: string, fieldId: string): Observable<ContexthelpAbstract> {
    return this.selectEntity([profile, docType, fieldId].join(','));//[profile, fieldId, docType]);
  }

}
