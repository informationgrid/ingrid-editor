import {Injectable} from '@angular/core';
import {ConfigService, Configuration} from './config/config.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {SessionStore} from '../store/session.store';
import {ContexthelpStore} from "../store/contexthelp/contexthelp.store";
import {ContexthelpQuery} from "../store/contexthelp/contexthelp.query";
import {Observable} from "rxjs";
import {map, tap} from "rxjs/operators";
import {d} from "@datorama/akita-ngdevtools";

@Injectable({
  providedIn: 'root'
})
export class ContexthelpService {
  private configuration: Configuration;

  constructor(private sessionStore: SessionStore,
              private http: HttpClient, configService: ConfigService,
              private contexthelpQuery: ContexthelpQuery,
              private contexthelpStore: ContexthelpStore,
  ) {

    this.configuration = configService.getConfiguration();
  }

  getAvailableHelpFieldIds(profile: string, docType: string): Observable<String[]> {
    const IDs = this.contexthelpQuery.getAvailableHelpFieldIds(profile, docType);
    if (IDs.length < 1) {
      this.getIdsFromBackend(profile, docType).subscribe(helpfieldIds => {
        helpfieldIds.forEach(fieldId => this.contexthelpStore.add({docType, profile, fieldId, fakeId: ""}))
      });
    }
    return this.contexthelpQuery.availableHelpFieldIds(profile, docType);
  }

  getContexthelpText(profile: string, docType: string, fieldId: string): Observable<String> {
    let ctxHelp = this.contexthelpQuery.getContexthelp(profile, docType, fieldId);
    if (ctxHelp === undefined || !ctxHelp.helptext) {
      this.getHelptextFromBackend(profile, docType, fieldId).subscribe(helptext => {
        this.contexthelpStore.add({docType, profile, fieldId, helptext, fakeId: ""})
      });
    }
    return this.contexthelpQuery.contexthelp(profile, docType, fieldId).pipe(
      map(ctxHelp => ctxHelp && ctxHelp.helptext ?  ctxHelp.helptext : ""));
  }


  private getIdsFromBackend(profile: string, docType: string): Observable<any> {
    let httpParams = new HttpParams()
      .set('profile', profile)
      .set('docType', docType);
    return this.http.get(this.configuration.backendUrl + 'contexthelpIds', {params: httpParams});
  }

  private getHelptextFromBackend(profile: string, docType: string, fieldId: string): Observable<any> {
    let httpParams = new HttpParams()
      .set('fieldId', fieldId)
      .set('profile', profile)
      .set('docType', docType);
    return this.http.get(this.configuration.backendUrl + 'contexthelp', {params: httpParams});
  }


}
