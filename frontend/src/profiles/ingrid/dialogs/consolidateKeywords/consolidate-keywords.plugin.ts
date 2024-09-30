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
  FormularMenuItem,
  MenuId,
} from "../../../../app/+form/form-menu.service";
import { FormStateService } from "../../../../app/+form/form-state.service";
import { DocumentService } from "../../../../app/services/document/document.service";
import { ConfigService } from "../../../../app/services/config/config.service";
import { PluginService } from "../../../../app/services/plugin/plugin.service";
import { FormUtils } from "../../../../app/+form/form.utils";
import { Plugin } from "../../../../app/+catalog/+behaviours/plugin";
import { DocumentAbstract } from "../../../../app/store/document/document.model";

@Injectable({ providedIn: "root" })
export class ConsolidateKeywordsPlugin extends Plugin {
  id = "plugin.consolidate.keywords";
  name = "Schlagworte konsolidieren";
  description = "Schlagworte konsolidieren";
  defaultActive = true;
  forAddress = false;

  formMenuId: MenuId = "dataset";
  private isPresent = false;
  private readonly isPrivileged: boolean;
  private readonly button: FormularMenuItem = {
    title: this.name,
    name: "consolidate-keywords",
    action: () =>
      this.docEventsService.sendEvent({
        type: "OPEN_CONSOLIDATE_KEYWORDS_DIALOG",
      }),
  };

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

    this.isPrivileged =
      configService.hasCatAdminRights() || configService.hasMdAdminRights();
  }

  registerForm() {
    super.registerForm();
    // only add menu item in form if user is privileged and not for address
    if (this.isPrivileged && !this.forAddress) {
      const onDocLoad = this.documentTreeQuery.openedDocument$.subscribe(
        (doc) => this.handleMenuItem(doc),
      );

      const onEvent = this.docEvents
        .onEvent("OPEN_CONSOLIDATE_KEYWORDS_DIALOG")
        .subscribe(async () => await this.handleConsolidateKeywordsAction());
      this.formSubscriptions.push(onDocLoad); // Add menu button
      this.formSubscriptions.push(onEvent); // Open dialog
    }
  }

  private handleMenuItem(doc: DocumentAbstract) {
    if (doc?._type === "FOLDER") {
      if (this.isPresent) {
        this.isPresent = false;
        this.formMenuService.removeMenuItem(
          this.formMenuId,
          "consolidate-keywords",
        );
      }
      return;
    }

    if (!this.isPresent) {
      this.isPresent = true;
      this.formMenuService.addMenuItem(this.formMenuId, this.button);
    }
  }

  private async handleConsolidateKeywordsAction() {
    const handled = await FormUtils.handleDirtyForm(
      this.formStateService,
      this.documentService,
      this.dialog,
      false,
    );
    if (!handled) {
      return;
    }

    this.openConsolidateKeywordsDialog().subscribe(async (confirmed) => {
      if (confirmed) {
        await FormUtils.handleDirtyForm(
          this.formStateService,
          this.documentService,
          this.dialog,
          this.forAddress,
        );
      }
    });
  }

  register() {
    super.register();
  }

  unregisterForm() {
    super.unregisterForm();
    if (this.isPresent) {
      this.formMenuService.removeMenuItem(
        this.formMenuId,
        "consolidate-keywords",
      );
    }
    this.isPresent = false;
  }

  unregister() {
    super.unregister();
  }

  openConsolidateKeywordsDialog(): Observable<boolean> {
    return this.dialog
      .open(ConsolidateDialogComponent, {
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
