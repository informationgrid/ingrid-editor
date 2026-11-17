/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { firstValueFrom } from "rxjs";
import { ConfigService, UserInfo } from "../services/config/config.service";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../dialogs/confirm/confirm-dialog.component";
import { FormStateService } from "../+form/form-state.service";

/**
 * Detects when the catalog of this tab no longer matches the current catalog
 * of the user session on the server. The current catalog is persisted
 * server-side per user, so it can be changed in another tab, window or device
 * (e.g. the switch-catalog flow does a full reload in that other tab). This
 * tab would then send all requests to the wrong catalog.
 *
 * The check only runs for users assigned to more than one catalog, since
 * users with a single catalog can never cause a divergence.
 */
@Injectable({
  providedIn: "root",
})
export class CatalogChangeService {
  private static readonly CACHE_TTL_MS = 15_000;

  private lastCheck: { at: number; catalogId: string } | null = null;
  private dialogOpen = false;
  private visibilityListenerRegistered = false;

  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private dialog: MatDialog,
    private formStateService: FormStateService,
  ) {}

  /**
   * Called before navigating within the catalog routes. Blocks navigation
   * with a dialog when the server session uses another catalog than this tab.
   */
  async runGuardCheck(url: string): Promise<boolean> {
    const user = this.configService.$userInfo.getValue();
    if (!user) return true;

    // a user with a single catalog assignment can never diverge
    if (this.isSingleCatalogUser(user)) return true;

    this.registerVisibilityListener();

    const serverCatalogId = await this.getServerCatalogId();
    // if the check is unavailable do not block the user
    if (!serverCatalogId) return true;

    if (serverCatalogId === ConfigService.catalogId) return true;

    this.showMismatchDialog(serverCatalogId);
    return false;
  }

  private isSingleCatalogUser(user: UserInfo): boolean {
    return (user.assignedCatalogs?.length ?? 0) < 2;
  }

  private async getServerCatalogId(): Promise<string | null> {
    const now = Date.now();
    if (
      this.lastCheck &&
      now - this.lastCheck.at < CatalogChangeService.CACHE_TTL_MS
    ) {
      return this.lastCheck.catalogId;
    }
    try {
      const info = await firstValueFrom(
        this.http.get<UserInfo>(
          this.configService.getConfiguration().backendUrl + "info/currentUser",
        ),
      );
      const catalogId = info?.currentCatalog?.id;
      if (catalogId) {
        this.lastCheck = { at: now, catalogId: catalogId };
      }
      return catalogId ?? null;
    } catch (e) {
      console.error("Could not fetch current catalog for mismatch check", e);
      return null;
    }
  }

  private registerVisibilityListener(): void {
    if (this.visibilityListenerRegistered) return;
    this.visibilityListenerRegistered = true;
    document.addEventListener("visibilitychange", async () => {
      if (document.hidden) return;
      const user = this.configService.$userInfo.getValue();
      if (!user || this.isSingleCatalogUser(user)) return;
      // catalog may have changed in another tab while this one was hidden
      this.lastCheck = null;
      const serverCatalogId = await this.getServerCatalogId();
      if (!serverCatalogId) return;
      if (serverCatalogId === ConfigService.catalogId) return;
      this.showMismatchDialog(serverCatalogId);
    });
  }

  private showMismatchDialog(serverCatalogId: string): void {
    if (this.dialogOpen) return;
    this.dialogOpen = true;

    const form = this.formStateService.getForm();
    const hasUnsavedChanges = !!form?.dirty;
    const catalogName =
      this.configService.$userInfo
        .getValue()
        .assignedCatalogs?.find((assigned) => assigned.id === serverCatalogId)
        ?.name ?? serverCatalogId;

    let message =
      `Der aktuelle Katalog wurde zwischenzeitlich in einem anderen Tab oder Fenster auf ` +
      `"${catalogName}" geändert. Aktionen in diesem Tab würden sonst im falschen Katalog ausgeführt.`;
    let buttons;
    if (hasUnsavedChanges) {
      message +=
        "\nAchtung: Beim Neuladen gehen Ihre nicht gespeicherten Änderungen verloren.";
      buttons = [
        { text: "Auf dieser Seite bleiben", id: "cancel", emphasize: true },
        { text: "Trotzdem neu laden", id: "reload", alignRight: true },
      ];
    } else {
      buttons = [
        { text: "Abbrechen", id: "cancel" },
        {
          text: "Diesen Tab neu laden",
          id: "reload",
          alignRight: true,
          emphasize: true,
        },
      ];
    }

    this.dialog
      .open(ConfirmDialogComponent, {
        hasBackdrop: true,
        disableClose: true,
        delayFocusTrap: true,
        data: {
          title: "Katalog wurde gewechselt",
          message: message,
          buttons: buttons,
        } as ConfirmDialogData,
      })
      .afterClosed()
      .subscribe((choice) => {
        this.dialogOpen = false;
        if (choice === "reload") {
          // a full reload re-initializes the tab and re-activates the catalog
          // of the current URL (existing boot behaviour)
          location.reload();
        }
      });
  }
}
