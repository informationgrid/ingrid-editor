import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { UserManagementComponent } from "./user-management/user-management.component";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../dialogs/confirm/confirm-dialog.component";
import { map } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";

@Injectable({
  providedIn: "root",
})
export class DeactivateGuard implements CanDeactivate<UserManagementComponent> {
  constructor(private dialog: MatDialog) {}

  canDeactivate(
    component: UserManagementComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const isDirty = component.user?.form?.dirty || component.group?.form?.dirty;

    if (!isDirty) {
      return true;
    }

    // Workaround for https://github.com/angular/angular/issues/9530
    // canDeactivate is called twice if there is a redirect like in the case
    // of a selected element   "/form" to "/form;id=xxx"
    if (nextState?.url.includes(";id=")) return true;

    return this.dialog
      .open(ConfirmDialogComponent, {
        disableClose: true,
        data: (<ConfirmDialogData>{
          title: "Änderungen verwerfen?",
          message: "Wollen Sie die Änderungen verwerfen?",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Verwerfen",
              id: "discard",
              alignRight: true,
              emphasize: true,
            },
          ],
        }) as ConfirmDialogData,
        hasBackdrop: true,
      })
      .afterClosed()
      .pipe(map((response) => response === "discard"));
  }
}
