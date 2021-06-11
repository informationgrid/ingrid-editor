import { createComponentFactory, Spectator } from "@ngneat/spectator";

import { SessionTimeoutInfoComponent } from "./session-timeout-info.component";
import { AuthService } from "../../services/security/auth.service";

describe("SessionTimeoutInfoComponent", () => {
  let spectator: Spectator<SessionTimeoutInfoComponent>;
  const createComponent = createComponentFactory({
    component: SessionTimeoutInfoComponent,
    mocks: [AuthService],
  });

  it("should create", () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
