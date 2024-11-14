/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { inject, Injectable } from "@angular/core";
import { ConfigService, Configuration } from "../config/config.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { SessionStore } from "../../store/session.store";
import { map, tap } from "rxjs/operators";
import { ContextHelpComponent } from "../../shared/context-help/context-help.component";
import {
  DialogPosition,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { ContextHelpAbstract } from "../../store/context-help/context-help.model";
import { ContextHelpStore } from "../../store/context-help/context-help.store";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ContextHelpService {
  private contextHelpStore = inject(ContextHelpStore);

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
  ) {
    this.configuration = configService.getConfiguration();
  }

  getAvailableHelpFieldIds(
    profile: string,
    docType: string,
  ): Observable<string[]> {
    return this.getIdsFromBackend(profile, docType);
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
    helpText$: Observable<string>,
    infoElement?: HTMLElement,
  ) {
    let dialogPosition: DialogPosition = infoElement
      ? {
          left: ContextHelpService.getLeftPosition(infoElement),
          top: ContextHelpService.getTopPosition(infoElement),
        }
      : null;

    // If any position is under 0 meaning outside the window,
    // the dialog will be centered for accessibility.
    if (
      parseInt(dialogPosition?.left) < 0 ||
      parseInt(dialogPosition?.top) < 0
    ) {
      dialogPosition = null;
    }

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

  private getContextHelpText(
    profile: string,
    docType: string,
    fieldId: string,
  ): Observable<string> {
    const contextHelp = this.contextHelpStore.get(profile, docType, fieldId);
    if (contextHelp === undefined || !contextHelp.helpText) {
      return this.getHelptextFromBackend(profile, docType, fieldId).pipe(
        tap((help) => this.contextHelpStore.add(help)),
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
