import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
} from "@angular/router";
import { Injectable } from "@angular/core";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../dialogs/confirm/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { FormComponent } from "../+form/form/form.component";
import { AddressComponent } from "../+address/address/address.component";
import { DocumentService } from "../services/document/document.service";
import { FormStateService } from "../+form/form-state.service";
import { IgeDocument } from "../models/ige-document";
import { BehaviourService } from "../services/behavior/behaviour.service";

@Injectable({
  providedIn: "root",
})
export class FormChangeDeactivateGuard implements CanDeactivate<FormComponent> {
  constructor(
    private dialog: MatDialog,
    private documentService: DocumentService,
    private formStateService: FormStateService,
    private behaviourService: BehaviourService
  ) {}

  // TODO: find another way to reset form instead of reloading, which makes a backend request
  canDeactivate(
    target: FormComponent | AddressComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean> {
    // TODO: unsubscribe from form plugins
    if (
      currentState.url.indexOf("/form") === 0 &&
      nextState.url.indexOf("/form") === -1
    ) {
      console.log("redirect from form");
      this.behaviourService.registerState$.next({
        register: false,
        address: false,
      });
    } else if (
      currentState.url.indexOf("/address") === 0 &&
      nextState.url.indexOf("/address") === -1
    ) {
      console.log("redirect from address");
      this.behaviourService.registerState$.next({
        register: false,
        address: true,
      });
    }

    // do not check when we navigate within the current page (loading another document)
    // only check if we actually leave the page
    if (
      FormChangeDeactivateGuard.pageIsNotLeft(
        currentState.url,
        nextState.url
      ) &&
      !FormChangeDeactivateGuard.basepageIsNext(currentState.url, nextState.url)
    ) {
      return of(true);
    }

    const formHasChanged = this.formStateService.getForm()?.dirty;

    if (!formHasChanged) {
      return of(true);
    }
    return this.handleFormHasChanged(target);
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
      await this.documentService
        .save(form, false, isAddress, null, true)
        .toPromise();
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
    let currentPrefix = currentUrl.substring(0, 5);
    return nextUrl.indexOf(currentPrefix) === 0;
  }

  private static basepageIsNext(currentUrl: string, nextUrl: string) {
    let currentPrefix = currentUrl.substring(0, 5);
    return !nextUrl.includes(";id=");
  }
}
