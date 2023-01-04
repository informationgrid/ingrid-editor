import { ResearchService } from "./research.service";
import { createServiceFactory, SpectatorService } from "@ngneat/spectator";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ConfigService } from "../services/config/config.service";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
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
