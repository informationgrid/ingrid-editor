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
import {
  EventData,
  EventResponder,
  EventService,
  IgeEvent,
  IgeEventResultType,
} from "../../../../services/event/event.service";
import { TreeQuery } from "../../../../store/tree/tree.query";
import { AddressTreeQuery } from "../../../../store/address-tree/address-tree.query";
import { filter } from "rxjs/operators";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../../dialogs/confirm/confirm-dialog.component";
import { UserService } from "../../../../services/user/user.service";
import { User } from "../../../../+user/user";
import { MatDialog } from "@angular/material/dialog";
import { PermissionsDialogComponent } from "../ShowDocumentPermissions/permissions-dialog/permissions-dialog.component";
import { DocEventsService } from "../../../../services/event/doc-events.service";
import { FormMenuService, MenuId } from "../../../../+form/form-menu.service";
import { TransferResponsibilityDialogComponent } from "../../../../+user/user/transfer-responsibility-dialog/transfer-responsibility-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfigService } from "../../../../services/config/config.service";
import { FormUtils } from "../../../../+form/form.utils";
import { FormStateService } from "../../../../+form/form-state.service";
import { DocumentService } from "../../../../services/document/document.service";
import { PluginService } from "../../../../services/plugin/plugin.service";
import { Plugin } from "../../plugin";

@Injectable({ providedIn: "root" })
export class AssignedUserBehaviour extends Plugin {
  id = "plugin.assigned.user";
  name = "Verantwortlicher Benutzer";
  description =
    "Datensätze erhalten einen verantwortlichen Benutzer, der von Katalog Administratoren geändert werden kann. In der Benutzerverwaltung kann die Verantwortung übertragen werden. Nutzer die Verantwortlichkeiten haben können nicht gelöscht werden";
  defaultActive = true;
  private readonly isPrivileged: boolean;

  constructor(
    private eventService: EventService,
    private userService: UserService,
    private docEvents: DocEventsService,
    private docEventsService: DocEventsService,
    private addressTreeQuery: AddressTreeQuery,
    private documentTreeQuery: TreeQuery,
    private formMenuService: FormMenuService,
    private formStateService: FormStateService,
    private documentService: DocumentService,
    configService: ConfigService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    super();
    inject(PluginService).registerPlugin(this);

    let role = configService.$userInfo.getValue().role;
    // TODO: this should be centralized (configService?)
    this.isPrivileged =
      role === "ige-super-admin" || role === "cat-admin" || role === "md-admin";
  }

  formMenuId: MenuId;

  registerForm() {
    super.registerForm();

    this.formSubscriptions.push(
      this.docEvents.onEvent("OPEN_ASSIGN_USER_DIALOG").subscribe((event) => {
        this.openAssignUserDialog(event.data.id);
      }),
    );

    this.formMenuId = this.forAddress ? "address" : "dataset";

    const treeQuery = this.forAddress
      ? this.addressTreeQuery
      : this.documentTreeQuery;

    // only add menu item in form if user is privileged
    if (this.isPrivileged) {
      const onDocLoad = treeQuery.openedDocument$.subscribe((doc) => {
        const button = {
          title: "Verantwortlichkeit ändern",
          name: "assign-user",
          action: () =>
            this.docEventsService.sendEvent({
              type: "OPEN_ASSIGN_USER_DIALOG",
              data: { id: doc.id },
            }),
        };
        // refresh menu item
        this.formMenuService.removeMenuItem(this.formMenuId, "assign-user");
        this.formMenuService.addMenuItem(this.formMenuId, button);
      });
      this.formSubscriptions.push(onDocLoad);
    }
  }

  register() {
    super.register();

    // add menu item for user management
    let selectedUser: User;
    this.subscriptions.push(
      this.userService.selectedUser$.subscribe((user) => {
        selectedUser = user;
      }),
      this.eventService
        .respondToEvent(IgeEvent.DELETE_USER)
        .subscribe((eventResponder) => this.handleEvent(eventResponder)),
    );
    this.formMenuService.addMenuItem("user", {
      title: "Verantwortung übertragen",
      name: "transfer-responsibility",
      action: () => this.handleTransferResponsibility(selectedUser),
    });
  }

  unregisterForm() {
    super.unregisterForm();
    if (this.isActive) {
      this.formMenuService.removeMenuItem("address", "assign-user");
      this.formMenuService.removeMenuItem("dataset", "assign-user");
    }
  }

  unregister() {
    super.unregister();
    this.formMenuService.removeMenuItem("user", "transfer-responsibility");
  }

  private handleEvent(eventResponder: EventResponder) {
    let success = false;
    const user = eventResponder.data as User;

    this.userService.getAssignedDatasets(user.id).subscribe((datasets) => {
      if (datasets.length > 0) {
        this.dialog
          .open(ConfirmDialogComponent, {
            data: {
              title: "Benutzer löschen",
              message: `Der Benutzer "${user.login}" ist noch für ${datasets.length} Datensätze verantwortlich. Bitte übertragen Sie vor dem Löschen die Verantwortung auf einen anderen Benutzer mit denselben Gruppen (Berechtigungen).`,
              confirmButtonText: "Verantwortung übertragen",
            } as ConfirmDialogData,
          })
          .afterClosed()
          .pipe(filter((result) => result))
          .subscribe(async () => {
            const handled = await this.handleTransferResponsibility(user);
            const responseData = this.buildResponse(handled);
            eventResponder.eventResponseHandler(responseData);
          });
        return;
      } else {
        success = true;
      }
      const responseData = this.buildResponse(success);
      eventResponder.eventResponseHandler(responseData);
    });
  }

  private buildResponse(isSuccess: boolean): EventData {
    return {
      result: isSuccess ? IgeEventResultType.SUCCESS : IgeEventResultType.FAIL,
      data: isSuccess ? null : "this info comes from assigned user behaviour",
    };
  }

  private async openAssignUserDialog(docId: number) {
    const query = this.forAddress
      ? this.addressTreeQuery
      : this.documentTreeQuery;
    const currentUUID = query.getOpenedDocument()._uuid;
    console.log("currentUUID", currentUUID);

    const handled = await FormUtils.handleDirtyForm(
      this.formStateService.getForm(),
      this.documentService,
      this.dialog,
      this.forAddress,
    );
    if (!handled) {
      return;
    }

    this.dialog
      .open(PermissionsDialogComponent, {
        width: "780px",
        data: {
          id: docId,
          forResponsibility: true,
        },
        delayFocusTrap: true,
      })
      .afterClosed()
      .subscribe(() => {
        this.documentService.reload$.next({
          uuid: currentUUID,
          forAddress: this.forAddress,
        });
      });
  }

  handleTransferResponsibility(oldUser: User): Promise<boolean> {
    return new Promise((resolve) => {
      this.dialog
        .open(TransferResponsibilityDialogComponent, {
          width: "780px",
          data: {
            users: this.userService.users$.value,
            oldUser: oldUser,
          },
          delayFocusTrap: true,
        })
        .afterClosed()
        .subscribe((result) => {
          if (result) {
            this.snackBar.open("Verantwortung übertragen.");
            resolve(true);
          } else {
            resolve(false);
          }
        });
    });
  }
}
