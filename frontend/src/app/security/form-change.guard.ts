import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { firstValueFrom, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { FormComponent } from "../+form/form/form.component";
import { AddressComponent } from "../+address/address/address.component";
import { DocumentService } from "../services/document/document.service";
import { FormStateService } from "../+form/form-state.service";
import { IgeDocument } from "../models/ige-document";
import { ConfigService } from "../services/config/config.service";
import { PluginService } from "../services/plugin/plugin.service";

@Injectable({
  providedIn: "root",
})
export class FormChangeDeactivateGuard {
  private static prefixLength: number;

  constructor(
    private dialog: MatDialog,
    private documentService: DocumentService,
    private formStateService: FormStateService,
    private pluginService: PluginService
  ) {
    // additionally to the catalog info in the url we also use additional 6 characters
    // to include slashes and `form` path
    FormChangeDeactivateGuard.prefixLength = ConfigService.catalogId.length + 6;
  }

  // TODO: find another way to reset form instead of reloading, which makes a backend request
  //       we could use formOptions.resetModel()
  canDeactivate(
    target: FormComponent | AddressComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean> {
    // do not check when we navigate within the current page (loading another document)
    // only check if we actually leave the page
    const stayOnPage = FormChangeDeactivateGuard.pageIsNotLeft(
      currentState.url,
      nextState.url
    );
    if (stayOnPage) {
      return of(true);
    }

    const formHasChanged = this.formStateService.getForm()?.dirty;

    if (!formHasChanged) {
      this.handleBehaviourRegistration(currentState, nextState);
      return of(true);
    }

    return this.handleFormHasChanged(target).pipe(
      tap((leavePage) => {
        if (leavePage) {
          this.handleBehaviourRegistration(currentState, nextState);
          this.formStateService.getForm().reset();
        }
      })
    );
  }

  private handleBehaviourRegistration(
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ) {
    const documentPath = `/${ConfigService.catalogId}/form`;
    if (
      currentState.url.indexOf(documentPath) === 0 &&
      nextState.url.indexOf(documentPath) !== 0
    ) {
      // unsubscribe from form plugins
      this.pluginService.pluginState$.next({
        register: false,
        address: false,
      });
    } else {
      const addressPath = `/${ConfigService.catalogId}/address`;
      if (
        currentState.url.indexOf(addressPath) === 0 &&
        nextState.url.indexOf(addressPath) !== 0
      ) {
        // subscribe form plugins
        this.pluginService.pluginState$.next({
          register: false,
          address: true,
        });
      }
    }
  }

  private handleFormHasChanged(target: any) {
    const type = target instanceof FormComponent ? "document" : "address";
    const currentUuid = (<IgeDocument>this.formStateService.getForm().value)
      ._uuid;
    return this.dialog
      .open(ConfirmDialogComponent, {
        hasBackdrop: true,
        disableClose: true,
        data: {
          title: "Änderungen speichern?",
          message:
            "Möchten Sie die Änderungen speichern bevor Sie die Seite verlassen?\nSie können die Änderungen auch verwerfen oder auf der Seite bleiben.",
          buttons: [
            { text: "Auf Seite bleiben", id: "stay" },
            { text: "Seite verlassen", id: "leave", alignRight: true },
            {
              text: "Speichern und verlassen",
              id: "save",
              emphasize: true,
              alignRight: true,
            },
          ],
        } as ConfirmDialogData,
      })
      .afterClosed()
      .pipe(
        tap((response) =>
          response ? this.handleAction(response, type, currentUuid) : null
        ),
        map((response) => response === "leave" || response === "save")
      );
  }

  private async handleAction(
    action: undefined | "save" | "stay",
    type: "document" | "address",
    currentUuid: string
  ) {
    const isAddress = type === "address";

    if (action === "save") {
      const form = this.formStateService.getForm()?.value;
      await firstValueFrom(
        this.documentService.save({
          data: form,
          isNewDoc: false,
          isAddress: isAddress,
          noVisualUpdates: true,
        })
      );
      this.documentService.reload$.next({
        uuid: currentUuid,
        forAddress: isAddress,
      });
    } else if (action === "stay") {
      // do nothing
    } else {
      this.documentService.reload$.next({
        uuid: currentUuid,
        forAddress: isAddress,
      });
    }
  }

  private static pageIsNotLeft(currentUrl: string, nextUrl: string) {
    let currentPrefix = currentUrl.substring(0, this.prefixLength);
    return nextUrl.indexOf(currentPrefix) === 0;
  }
}
