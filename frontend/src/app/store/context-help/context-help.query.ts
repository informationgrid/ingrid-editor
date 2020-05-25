import {Injectable} from '@angular/core';
import {QueryEntity} from '@datorama/akita';
import {ContexthelpState, ContextHelpStore} from './context-help.store';
import {ContextHelpAbstract} from './context-help.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContextHelpQuery extends QueryEntity<ContexthelpState, ContextHelpAbstract> {

  constructor(protected store: ContextHelpStore) {
    super(store);
  }

  getAvailableHelpFieldIds(profile: string, docType: string): string[] {
    return this.getAll().filter(h => h.docType === docType && h.profile === profile).map(h => h.fieldId);
  }

  getContexthelp(profile: string, docType: string, fieldId: string): ContextHelpAbstract {
    return this.getEntity([profile, docType, fieldId].join(','));
  }

  contexthelp(profile: string, docType: string, fieldId: string): Observable<ContextHelpAbstract> {
    return this.selectEntity([profile, docType, fieldId].join(',')); // [profile, fieldId, docType]);
  }

}
