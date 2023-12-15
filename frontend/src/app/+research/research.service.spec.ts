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
import { ResearchService } from "./research.service";
import { createServiceFactory, SpectatorService } from "@ngneat/spectator";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ConfigService } from "../services/config/config.service";
import { MatDialogModule } from "@angular/material/dialog";
import { ProfileService } from "../services/profile.service";

describe("ResearchService", () => {
  let spectator: SpectatorService<ResearchService>;
  const createService = createServiceFactory({
    service: ResearchService,
    imports: [HttpClientTestingModule, MatDialogModule],
    providers: [],
    mocks: [ConfigService, ProfileService],
  });

  beforeEach(() => (spectator = createService()));

  it("should be created", () => {
    expect(spectator.service).toBeTruthy();
  });
});
