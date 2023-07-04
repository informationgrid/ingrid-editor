import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../dialogs/confirm/confirm-dialog.component";
import { map, tap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { UserComponent } from "./user/user.component";
import { GroupComponent } from "./group/group.component";

@Injectable({
  providedIn: "root",
})
export class DeactivateGuard {
  constructor(private dialog: MatDialog) {}

  canDeactivate(
    component: UserComponent | GroupComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const isDirty = component.form?.dirty;

    if (!isDirty) {
      return true;
    }

    // Workaround for https://github.com/angular/angular/issues/9530
    // canDeactivate is called twice if there is a redirect like in the case
    // of a selected element   "/form" to "/form;id=xxx"
    if (nextState?.url.includes(";id=")) return true;

    const type = component instanceof UserComponent ? "user" : "group";
    const currentObject =
      component instanceof UserComponent
        ? component.model
        : component.form.value;

    return this.dialog
      .open(ConfirmDialogComponent, {
        disableClose: true,
        data: (<ConfirmDialogData>{
          title: "Änderungen speichern?",
          message:
            type == "user"
              ? "Es wurden Änderungen am ausgewählten Benutzer vorgenommen.\nMöchten Sie die Änderungen speichern?"
              : "Es wurden Änderungen an der ausgewählten Gruppe vorgenommen.\nMöchten Sie die Änderungen speichern?",
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Verwerfen",
              id: "discard",
              alignRight: true,
            },
            {
              text: "Speichern",
              id: "save",
              alignRight: true,
              emphasize: true,
            },
          ],
        }) as ConfirmDialogData,
        hasBackdrop: true,
      })
      .afterClosed()
      .pipe(
        tap((response) =>
          response
            ? this.handleAction(response, type, currentObject, component)
            : null
        ),
        map((response) => response === "discard" || response === "save")
      );
  }

  private async handleAction(
    action: undefined | "save" | "discard",
    type: "group" | "user",
    currentObject = null,
    component: UserComponent | GroupComponent
  ) {
    console.log(currentObject);
    if (action === "save") {
      type == "group"
        ? (<GroupComponent>component).saveGroup()
        : (<UserComponent>component).saveUser(currentObject);
    } else if (action === "discard") {
      console.log(action);
      type == "group"
        ? (<GroupComponent>component).discardGroup(currentObject)
        : (<UserComponent>component).discardUser(currentObject);
    } else {
      // do nothing
    }
  }
}
