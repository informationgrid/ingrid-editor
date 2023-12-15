/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import { ProfileService } from "./profile.service";
import {
  createServiceFactory,
  mockProvider,
  SpectatorService,
} from "@ngneat/spectator";
import { ConfigService, UserInfo } from "./config/config.service";
import { BehaviorSubject } from "rxjs";
import { ContextHelpService } from "./context-help/context-help.service";
import { ModalService } from "./modal/modal.service";
import { Catalog } from "../+catalog/services/catalog.model";

describe("ProfileService", () => {
  let spectator: SpectatorService<ProfileService>;
  const createService = createServiceFactory({
    service: ProfileService,
    providers: [
      mockProvider(ConfigService, {
        $userInfo: new BehaviorSubject<UserInfo>({
          assignedCatalogs: [],
          currentCatalog: {},
          name: "x",
          firstName: "x",
          lastName: "x",
          email: "x",
          role: "",
          groups: [],
          id: null,
          login: "y",
          version: null,
          lastLogin: new Date(),
          permissions: [],
        }),
      }),
    ],
    mocks: [ContextHelpService, ModalService],
  });

  beforeEach(() => {
    spectator = createService();
  });

  it("should get catalogs", () => {
    expect(spectator.service.getProfiles().length).toBe(0);
  });
});
