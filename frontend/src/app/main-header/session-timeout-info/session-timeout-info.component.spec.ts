import { createComponentFactory, Spectator } from "@ngneat/spectator";

import { SessionTimeoutInfoComponent } from "./session-timeout-info.component";
import { AuthService } from "../../services/security/auth.service";
import { KeycloakService } from "keycloak-angular";

describe("SessionTimeoutInfoComponent", () => {
  let spectator: Spectator<SessionTimeoutInfoComponent>;
  const createComponent = createComponentFactory({
    component: SessionTimeoutInfoComponent,
    mocks: [AuthService, KeycloakService],
  });

  it("should create", () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
