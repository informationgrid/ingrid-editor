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
import { TreeService } from "../+form/sidebars/tree/tree.service";
import { DocumentService } from "../services/document/document.service";
import { FormStateService } from "../+form/form-state.service";

@Injectable({
  providedIn: "root",
})
export class FormChangeDeactivateGuard implements CanDeactivate<FormComponent> {
  constructor(
    private dialog: MatDialog,
    private documentService: DocumentService,
    private formStateService: FormStateService,
    private treeService: TreeService
  ) {}

  // TODO: find another way to reset form instead of reloading, which makes a backend request
  canDeactivate(
    target: FormComponent | AddressComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean> {
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

    const type = target instanceof FormComponent ? "document" : "address";
    const formHasChanged = this.formStateService.getForm()?.dirty;

    if (formHasChanged) {
      const currentId = this.formStateService.getForm().value._id;
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
            response ? this.handleAction(response, type, currentId) : null
          ),
          map((response) => response === "leave" || response === "save")
        );
    }
    return of(true);
  }

  private async handleAction(
    action: undefined | "save" | "stay",
    type: "document" | "address",
    currentId
  ) {
    const isAddress = type === "address";

    if (action === "save") {
      const form = this.formStateService.getForm()?.value;
      await this.documentService
        .save(form, false, isAddress, null, true)
        .toPromise();
      this.documentService.reload$.next({
        id: currentId,
        forAddress: isAddress,
      });
    } else if (action === "stay") {
      this.treeService.selectTreeNode(isAddress, currentId);
    } else {
      this.documentService.reload$.next({
        id: currentId,
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
