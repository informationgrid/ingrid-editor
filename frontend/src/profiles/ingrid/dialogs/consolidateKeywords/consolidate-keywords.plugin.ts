/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { effect, inject, Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { ConsolidateDialogComponent } from "./consolidate-dialog/consolidate-dialog.component";
import { DocEventsService } from "../../../../app/services/event/doc-events.service";
import {
  FormMenuService,
  FormularMenuItem,
  MenuId,
} from "../../../../app/+form/form-menu.service";
import { ConfigService } from "../../../../app/services/config/config.service";
import { Plugin } from "../../../../app/+catalog/+behaviours/plugin";
import { DocumentAbstract } from "../../../../app/store/document/document.model";
import { TreeStore } from "../../../../app/store/tree/tree.store";

@Injectable({ providedIn: "root" })
export class ConsolidateKeywordsPlugin extends Plugin {
  id = "plugin.consolidate.keywords";
  name = "Schlagworte konsolidieren";
  description =
    "Bereits eingetragene Schlagworte werden neu analysiert und zu den verschiedenen Schlagwortfeldern hinzugefügt. Die Funktion befindet sich im 3-Punkte-Menü des Datensatzes.";
  defaultActive = true;

  private treeStore = inject(TreeStore);

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
    private formMenuService: FormMenuService,
    configService: ConfigService,
    private dialog: MatDialog,
  ) {
    super();
    this.isPrivileged =
      configService.hasCatAdminRights() || configService.hasMdAdminRights();

    effect(() => {
      if (!this.isActive() || !this.isPrivileged) return;

      this.handleMenuItem(
        this.generalStore.getOpenedDocument(this.forAddress()),
      );
    });
  }

  registerForm() {
    super.registerForm();
    // only add menu item in form if user is privileged and not for address
    if (this.isPrivileged && !this.forAddress()) {
      const onEvent = this.docEvents
        .onEvent("OPEN_CONSOLIDATE_KEYWORDS_DIALOG")
        .subscribe(async () => this.openConsolidateKeywordsDialog());
      // this.formSubscriptions.push(onDocLoad); // Add menu button
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
