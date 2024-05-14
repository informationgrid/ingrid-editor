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
    nextState?: RouterStateSnapshot,
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
          title: component.form?.invalid
            ? "Änderungen verwerfen?"
            : "Änderungen speichern?",
          message:
            (type == "user"
              ? "Es wurden Änderungen am ausgewählten Benutzer vorgenommen."
              : "Es wurden Änderungen an der ausgewählten Gruppe vorgenommen.") +
            (component.form?.invalid
              ? ""
              : "\nMöchten Sie die Änderungen speichern?"),
          buttons: [
            { text: "Abbrechen" },
            {
              text: "Verwerfen",
              id: "discard",
              alignRight: true,
              emphasize: false,
            },
          ].concat(
            component.form?.invalid
              ? []
              : [
                  {
                    text: "Speichern",
                    id: "save",
                    alignRight: true,
                    emphasize: true,
                  },
                ],
          ),
        }) as ConfirmDialogData,
        hasBackdrop: true,
      })
      .afterClosed()
      .pipe(
        tap((response) =>
          response
            ? this.handleAction(response, type, currentObject, component)
            : null,
        ),
        map((response) => response === "discard" || response === "save"),
      );
  }

  private async handleAction(
    action: undefined | "save" | "discard",
    type: "group" | "user",
    currentObject = null,
    component: UserComponent | GroupComponent,
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
