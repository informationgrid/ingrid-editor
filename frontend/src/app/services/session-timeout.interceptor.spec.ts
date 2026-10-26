/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
  createHttpFactory,
  HttpMethod,
  mockProvider,
  SpectatorHttp,
} from "@ngneat/spectator/vitest";
import { provideZonelessChangeDetection } from "@angular/core";
import { SessionTimeoutInterceptor } from "./session-timeout.interceptor";
import { GeneralStore } from "../store/general.store";
import { ConfigService } from "./config/config.service";
import { ModalService } from "./modal/modal.service";

describe("SessionTimeoutInterceptor", () => {
  let spectator: SpectatorHttp<SessionTimeoutInterceptor>;
  let generalStore: InstanceType<typeof GeneralStore>;

  const createHttp = createHttpFactory({
    service: SessionTimeoutInterceptor,
    providers: [
      provideZonelessChangeDetection(),
      mockProvider(ConfigService, {
        getConfiguration: () => ({ backendUrl: "http://localhost:8080/api/" }),
      }),
      mockProvider(ModalService),
    ],
  });

  beforeEach(() => {
    spectator = createHttp();
    generalStore = spectator.inject(GeneralStore);
  });

  it("should update session timeout and session duration in general store on refresh", async () => {
    spectator.service.refreshSession();

    const req = spectator.expectOne(
      "http://localhost:8080/api/info/refreshSession",
      HttpMethod.GET,
    );
    req.flush({ remaining: 900, total: 1800 });

    // Wait for promise resolution
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(generalStore.sessionTimeoutIn()).toBe(900);
    expect(generalStore.sessionDuration()).toBe(1800);
  });
});
