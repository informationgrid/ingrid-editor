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
import { map } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { ConsolidateDialogComponent } from "./consolidate-dialog/consolidate-dialog.component";
import { TreeQuery } from "../../../../app/store/tree/tree.query";
import { DocEventsService } from "../../../../app/services/event/doc-events.service";
import {
  FormMenuService,
  MenuId,
} from "../../../../app/+form/form-menu.service";
import { FormStateService } from "../../../../app/+form/form-state.service";
import { DocumentService } from "../../../../app/services/document/document.service";
import { ConfigService } from "../../../../app/services/config/config.service";
import { PluginService } from "../../../../app/services/plugin/plugin.service";
import { FormUtils } from "../../../../app/+form/form.utils";
import { Plugin } from "../../../../app/+catalog/+behaviours/plugin";

@Injectable({ providedIn: "root" })
export class ConsolidateKeywordsPlugin extends Plugin {
  id = "plugin.consolidate.keywords";
  name = "Schlagworte konsolidieren";
  description = "Schlagworte konsolidieren";
  defaultActive = true;
  forAddress = false;
  private readonly isPrivileged: boolean;

  constructor(
    private docEvents: DocEventsService,
    private docEventsService: DocEventsService,
    private documentTreeQuery: TreeQuery,
    private formMenuService: FormMenuService,
    private formStateService: FormStateService,
    private documentService: DocumentService,
    configService: ConfigService,
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
        .subscribe(async (event) => {
          const handled = await FormUtils.handleDirtyForm(
            this.formStateService,
            this.documentService,
            this.dialog,
            false,
          );
          if (!handled) {
            return;
          }

          this.openConsolidateKeywordsDialog(event.data.id).subscribe(
            async (confirmed) => {
              if (confirmed) {
                const handled = await FormUtils.handleDirtyForm(
                  this.formStateService,
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
          if (doc?._type === "FOLDER") return;
          const button = {
            title: "Schlagworte konsolidieren",
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
      this.formSubscriptions.push(onEvent);
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
      );
    }
  }

  unregister() {
    super.unregister();
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
