import {Injectable} from '@angular/core';
import {ConfigService, Configuration} from '../config/config.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {SessionStore} from '../../store/session.store';
import {ContextHelpStore} from '../../store/context-help/context-help.store';
import {ContextHelpQuery} from '../../store/context-help/context-help.query';
import {Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContextHelpService {
  private configuration: Configuration;

  constructor(private sessionStore: SessionStore,
              private http: HttpClient, configService: ConfigService,
              private contexthelpQuery: ContextHelpQuery,
              private contexthelpStore: ContextHelpStore
  ) {

    this.configuration = configService.getConfiguration();
  }

  getAvailableHelpFieldIds(profile: string, docType: string): Observable<string[]> {

    const IDs = this.contexthelpQuery.getAvailableHelpFieldIds(profile, docType);
    if (IDs.length < 1) {
      return this.getIdsFromBackend(profile, docType)
        .pipe(
          tap(
            helpfieldIds => helpfieldIds.forEach(fieldId => this.contexthelpStore.add({docType, profile, fieldId, fakeId: ''}))
          )
        );
    } else {
      return of(this.contexthelpQuery.getAvailableHelpFieldIds(profile, docType));
    }

  }

  getContexthelpText(profile: string, docType: string, fieldId: string): Observable<string> {

    const ctxHelp = this.contexthelpQuery.getContexthelp(profile, docType, fieldId);
    if (ctxHelp === undefined || !ctxHelp.helptext) {
      this.getHelptextFromBackend(profile, docType, fieldId).subscribe(helptext => {
        this.contexthelpStore.add({docType, profile, fieldId, helptext, fakeId: ''})
      });
    }
    return this.contexthelpQuery.contexthelp(profile, docType, fieldId).pipe(
      map(help => help && help.helptext ? help.helptext : ''));

  }


  private getIdsFromBackend(profile: string, docType: string): Observable<string[]> {

    const httpParams = new HttpParams()
      .set('profile', profile)
      .set('docType', docType);
    return this.http.get<string[]>(this.configuration.backendUrl + 'contexthelpIds', {params: httpParams});

  }

  private getHelptextFromBackend(profile: string, docType: string, fieldId: string): Observable<any> {

    const httpParams = new HttpParams()
      .set('fieldId', fieldId)
      .set('profile', profile)
      .set('docType', docType);
    return this.http.get(this.configuration.backendUrl + 'contexthelp', {params: httpParams});

  }


}
