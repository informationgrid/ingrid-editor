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
import { filter, map } from "rxjs/operators";
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
import { Observable } from "rxjs";
import { DocumentDataService } from "../../../../services/document/document-data.service";
import { ConsolidateDialogComponent } from "./consolidate-dialog/consolidate-dialog.component";

@Injectable({ providedIn: "root" })
export class ConsolidateKeywordsPlugin extends Plugin {
  id = "plugin.consolidate.keywords";
  name = "Schlagwörter konsolidieren";
  description = "Schlagwörter konsolidieren"; // TODO
  defaultActive = true;
  forAddress = false; // TODO
  private readonly isPrivileged: boolean;

  constructor(
    private eventService: EventService,
    private docEvents: DocEventsService,
    private docEventsService: DocEventsService,
    private documentTreeQuery: TreeQuery,
    private documentDataService: DocumentDataService,
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
    this.isPrivileged =
      role === "ige-super-admin" || role === "cat-admin" || role === "md-admin";
  }

  formMenuId: MenuId = "dataset";

  registerForm() {
    super.registerForm();

    // only add menu item in form if user is privileged and not for address
    if (this.isPrivileged && !this.forAddress) {
      const onEvent = this.docEvents
        .onEvent("OPEN_CONSOLIDATE_KEYWORDS_DIALOG")
        .subscribe((event) => {
          this.openConsolidateKeywordsDialog(event.data.id).subscribe(
            async (confirmed) => {
              if (confirmed) {
                const handled = await FormUtils.handleDirtyForm(
                  this.formStateService.getForm(),
                  this.documentService,
                  this.dialog,
                  this.forAddress,
                );
                if (handled)
                  console.log("consolidate keywords for docId", event.data.id);
              }
            },
          );
        });

      const onDocLoad = this.documentTreeQuery.openedDocument$.subscribe(
        (doc) => {
          const button = {
            title: "Schlagwörter konsolidieren",
            name: "consolidate-keywords",
            action: () =>
              this.docEventsService.sendEvent({
                type: "OPEN_CONSOLIDATE_KEYWORDS_DIALOG",
                data: { id: doc.id },
              }),
          };
          // refresh menu item
          this.formMenuService.removeMenuItem(
            this.formMenuId,
            "consolidate-keywords",
          );
          this.formMenuService.addMenuItem(this.formMenuId, button);
        },
      );

      this.formSubscriptions.push(onDocLoad);
    }
  }

  register() {
    super.register();
  }

  unregisterForm() {
    super.unregisterForm();
    if (this.isActive) {
      this.formMenuService.removeMenuItem(
        this.formMenuId,
        "consolidate-keywords",
      ); // TODO
    }
  }

  unregister() {
    super.unregister();
  }

  private handleEvent(eventResponder: EventResponder) {
    let success = false;
    const user = eventResponder.data as User;
  }

  private buildResponse(isSuccess: boolean): EventData {
    return {
      result: isSuccess ? IgeEventResultType.SUCCESS : IgeEventResultType.FAIL,
      data: isSuccess ? null : "this info comes from assigned user behaviour",
    };
  }

  openConsolidateKeywordsDialog(id: number): Observable<boolean> {
    return this.dialog
      .open(ConsolidateDialogComponent, {
        data: {
          id: id,
        },
        hasBackdrop: true,
      })
      .afterClosed()
      .pipe(
        map((response) => {
          return response === "confirm";
        }),
      );
  }
}
