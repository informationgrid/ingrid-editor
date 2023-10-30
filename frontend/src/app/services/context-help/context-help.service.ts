import { Injectable } from "@angular/core";
import { ConfigService, Configuration } from "../config/config.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { SessionStore } from "../../store/session.store";
import { ContextHelpStore } from "../../store/context-help/context-help.store";
import { ContextHelpQuery } from "../../store/context-help/context-help.query";
import { Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { ContextHelpComponent } from "../../shared/context-help/context-help.component";
import {
  DialogPosition,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { ContextHelpAbstract } from "../../store/context-help/context-help.model";

@Injectable({
  providedIn: "root",
})
export class ContextHelpService {
  private static contextDialogHeight = 400;
  private static contextDialogMaxHeight = 600;
  private static contextDialogWidth = 500;
  private static contextDialogMaxWidth = 800;

  private configuration: Configuration;

  private currentDialog: MatDialogRef<ContextHelpComponent, any>;

  private static getLeftPosition(infoElement: HTMLElement) {
    const leftPosition =
      window.innerWidth - infoElement.getBoundingClientRect().left;
    const enoughSpaceBeneath = leftPosition > this.contextDialogWidth;

    return enoughSpaceBeneath
      ? `${infoElement.getBoundingClientRect().left}px`
      : `${
          infoElement.getBoundingClientRect().left - this.contextDialogWidth
        }px`;
  }

  private static getTopPosition(infoElement: HTMLElement) {
    const topPosition =
      window.innerHeight - infoElement.getBoundingClientRect().top;
    const enoughSpaceBeneath = topPosition > this.contextDialogHeight;
    const altTop =
      infoElement.getBoundingClientRect().top - this.contextDialogHeight;
    const enoughSpaceAbove = altTop > 0;

    return !enoughSpaceBeneath && enoughSpaceAbove
      ? `${altTop}px`
      : `${infoElement.getBoundingClientRect().top}px`;
  }

  constructor(
    private sessionStore: SessionStore,
    public dialog: MatDialog,
    private http: HttpClient,
    configService: ConfigService,
    private contextHelpQuery: ContextHelpQuery,
    private contextHelpStore: ContextHelpStore,
  ) {
    this.configuration = configService.getConfiguration();
  }

  getAvailableHelpFieldIds(
    profile: string,
    docType: string,
  ): Observable<string[]> {
    return this.getIdsFromBackend(profile, docType).pipe(
      tap((helpfieldIds) =>
        this.addHelpToStore(profile, docType, helpfieldIds),
      ),
    );
  }

  showContextHelp(
    profile: string,
    docType: string,
    fieldId: string,
    label: string,
    infoElement: HTMLElement,
  ) {
    const helpText$ = this.getContextHelpText(profile, docType, fieldId); // allows passing in a custom help text
    this.showContextHelpPopup(label, helpText$, infoElement);
  }

  public showContextHelpPopup(
    label: string,
    helpText$: Observable<String>,
    infoElement?: HTMLElement,
  ) {
    const dialogPosition: DialogPosition = infoElement
      ? {
          left: ContextHelpService.getLeftPosition(infoElement),
          top: ContextHelpService.getTopPosition(infoElement),
        }
      : null;

    this.currentDialog?.close();

    this.currentDialog = this.dialog.open(ContextHelpComponent, {
      data: {
        title: label,
        description$: helpText$,
      },
      backdropClass: "cdk-overlay-transparent-backdrop",
      hasBackdrop: false,
      closeOnNavigation: true,
      position: dialogPosition,
    });
  }

  private addHelpToStore(
    profile: string,
    docType: string,
    helpfieldIds: string[],
  ) {
    helpfieldIds.forEach((fieldId) =>
      this.contextHelpStore.add({ docType, profile, fieldId }),
    );
  }

  private getContextHelpText(
    profile: string,
    docType: string,
    fieldId: string,
  ): Observable<string> {
    const contextHelp = this.contextHelpQuery.getContextHelp(
      profile,
      docType,
      fieldId,
    );
    if (contextHelp === undefined || !contextHelp.helpText) {
      return this.getHelptextFromBackend(profile, docType, fieldId).pipe(
        tap((help) => this.contextHelpStore.update(help)),
        map((help) => help.helpText),
      );
    }

    return of(contextHelp.helpText);
  }

  private getIdsFromBackend(
    profile: string,
    docType: string,
  ): Observable<string[]> {
    const httpParams = new HttpParams()
      .set("profile", profile)
      .set("docType", docType);
    return this.http.get<string[]>(
      this.configuration.backendUrl + "contexthelpIds",
      { params: httpParams },
    );
  }

  private getHelptextFromBackend(
    profile: string,
    docType: string,
    fieldId: string,
  ): Observable<ContextHelpAbstract> {
    const httpParams = new HttpParams()
      .set("fieldId", fieldId)
      .set("profile", profile)
      .set("docType", docType);
    return this.http.get<ContextHelpAbstract>(
      this.configuration.backendUrl + "contexthelp",
      { params: httpParams },
    );
  }
}
