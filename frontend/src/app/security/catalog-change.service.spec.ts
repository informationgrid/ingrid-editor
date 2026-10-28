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
import {
  createServiceFactory,
  mockProvider,
  SpectatorService,
} from "@ngneat/spectator/vitest";
import { of } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { provideZonelessChangeDetection } from "@angular/core";
import { ConfigService, UserInfo } from "../services/config/config.service";
import { FormStateService } from "../+form/form-state.service";
import { CatalogChangeService } from "./catalog-change.service";

function createUserInfo(assignedCatalogs: string[]): UserInfo {
  return {
    id: null,
    login: "user",
    name: "user",
    firstName: "u",
    lastName: "ser",
    email: "x",
    assignedCatalogs: assignedCatalogs.map((id) => ({ id: id })),
    role: "",
    groups: [],
    currentCatalog: { id: assignedCatalogs[0] },
    permissions: [],
    linkedProfiles: [],
    fromLdap: false,
    version: null,
    lastLogin: new Date(),
  };
}

describe("CatalogChangeService", () => {
  let spectator: SpectatorService<CatalogChangeService>;
  let dialogRef: { afterClosed: () => any };

  const createService = createServiceFactory({
    service: CatalogChangeService,
    providers: [
      provideZonelessChangeDetection(),
      mockProvider(ConfigService, {
        $userInfo: new (class {
          constructor(private value: any) {}
          getValue() {
            return this.value;
          }
        })(createUserInfo(["catA", "catB"])),
        getConfiguration: () => ({ backendUrl: "api/" }),
      }),
      mockProvider(FormStateService, { getForm: () => null }),
    ],
    mocks: [HttpClient, MatDialog],
  });

  beforeEach(() => {
    ConfigService.catalogId = "catA";
    spectator = createService();
    dialogRef = { afterClosed: () => of("cancel") };
    vi.spyOn(spectator.inject(MatDialog), "open").mockReturnValue(
      dialogRef as any,
    );
  });

  it("allows navigation for single-catalog users without server check", async () => {
    spectator.inject(ConfigService).$userInfo = new (class {
      constructor(private value: any) {}
      getValue() {
        return this.value;
      }
    })(createUserInfo(["catA"])) as any;

    const result = await spectator.service.runGuardCheck("/catA/form");

    expect(result).toBe(true);
    expect(spectator.inject(HttpClient).get).not.toHaveBeenCalled();
  });

  it("allows navigation when server catalog matches tab catalog", async () => {
    const httpGet = vi
      .spyOn(spectator.inject(HttpClient), "get")
      .mockReturnValue(of({ currentCatalog: { id: "catA" } }));

    const result = await spectator.service.runGuardCheck("/catA/form");

    expect(result).toBe(true);
    expect(spectator.inject(MatDialog).open).not.toHaveBeenCalled();
  });

  it("opens dialog and blocks navigation when server catalog differs", async () => {
    const httpGet = vi
      .spyOn(spectator.inject(HttpClient), "get")
      .mockReturnValue(of({ currentCatalog: { id: "catB" } }));

    const result = await spectator.service.runGuardCheck("/catA/form");

    expect(result).toBe(false);
    expect(spectator.inject(MatDialog).open).toHaveBeenCalledTimes(1);
  });

  it("caches the server catalog check", async () => {
    const httpGet = vi
      .spyOn(spectator.inject(HttpClient), "get")
      .mockReturnValue(of({ currentCatalog: { id: "catA" } }));

    await spectator.service.runGuardCheck("/catA/form");
    await spectator.service.runGuardCheck("/catA/research");

    expect(httpGet).toHaveBeenCalledTimes(1);
  });
});
