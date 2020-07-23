import {Injectable} from '@angular/core';
import {ConfigService, Configuration} from '../config/config.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {SessionStore} from '../../store/session.store';
import {ContextHelpStore} from '../../store/context-help/context-help.store';
import {ContextHelpQuery} from '../../store/context-help/context-help.query';
import {Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {ContextHelpComponent} from '../../shared/context-help/context-help.component';
import {MatDialog} from '@angular/material/dialog';
import {ContextHelpAbstract} from '../../store/context-help/context-help.model';

@Injectable({
  providedIn: 'root'
})
export class ContextHelpService {

  private static contextDialogHeight = 400;

  private configuration: Configuration;

  private static getLeftPosition = (infoElement: HTMLElement) => `${infoElement.getBoundingClientRect().left}px`

  private static getTopPosition(infoElement: HTMLElement) {
    const topPosition = window.innerHeight - infoElement.getBoundingClientRect().top;
    const enoughSpaceBeneath = topPosition > this.contextDialogHeight;

    return enoughSpaceBeneath
      ? `${infoElement.getBoundingClientRect().top}px`
      : `${infoElement.getBoundingClientRect().top - this.contextDialogHeight}px`
  }


  constructor(private sessionStore: SessionStore,
              public dialog: MatDialog,
              private http: HttpClient, configService: ConfigService,
              private contextHelpQuery: ContextHelpQuery,
              private contextHelpStore: ContextHelpStore
  ) {

    this.configuration = configService.getConfiguration();
  }

  getAvailableHelpFieldIds(profile: string, docType: string): Observable<string[]> {

    return this.getIdsFromBackend(profile, docType)
      .pipe(
        tap(helpfieldIds => this.addHelpToStore(profile, docType, helpfieldIds))
      );

  }

  showContextHelp(profile: string, docType: string, fieldId: string, label: string, infoElement: HTMLElement) {

    const helpText$ = this.getContextHelpText(profile, docType, fieldId);

    this.dialog.open(ContextHelpComponent, {
      data: {
        title: label,
        description$: helpText$
      },
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      closeOnNavigation: true,
      position: {
        left: ContextHelpService.getLeftPosition(infoElement),
        top: ContextHelpService.getTopPosition(infoElement)
      },
      autoFocus: false,
      height: ContextHelpService.contextDialogHeight + 'px',
      width: '330px'
    });

  }

  private addHelpToStore(profile: string, docType: string, helpfieldIds: string[]) {
    helpfieldIds.forEach(fieldId => this.contextHelpStore.add({docType, profile, fieldId}));
  }

  private getContextHelpText(profile: string, docType: string, fieldId: string): Observable<string> {

    const contextHelp = this.contextHelpQuery.getContextHelp(profile, docType, fieldId);
    if (contextHelp === undefined || !contextHelp.helpText) {
      return this.getHelptextFromBackend(profile, docType, fieldId)
        .pipe(
          tap(help => this.contextHelpStore.update(help)),
          map(help => help.helpText)
        )
    }

    return of(contextHelp.helpText);

  }

  private getIdsFromBackend(profile: string, docType: string): Observable<string[]> {

    const httpParams = new HttpParams()
      .set('profile', profile)
      .set('docType', docType);
    return this.http.get<string[]>(this.configuration.backendUrl + 'contexthelpIds', {params: httpParams});

  }

  private getHelptextFromBackend(profile: string, docType: string, fieldId: string): Observable<ContextHelpAbstract> {

    const httpParams = new HttpParams()
      .set('fieldId', fieldId)
      .set('profile', profile)
      .set('docType', docType);
    return this.http.get<ContextHelpAbstract>(this.configuration.backendUrl + 'contexthelp', {params: httpParams});

  }

}
