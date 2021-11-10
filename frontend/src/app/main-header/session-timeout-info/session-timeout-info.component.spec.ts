import { createComponentFactory, Spectator } from "@ngneat/spectator";

import { SessionTimeoutInfoComponent } from "./session-timeout-info.component";
import { AuthenticationFactory } from "../../security/auth.factory";

describe("SessionTimeoutInfoComponent", () => {
  let spectator: Spectator<SessionTimeoutInfoComponent>;
  const createComponent = createComponentFactory({
    component: SessionTimeoutInfoComponent,
    mocks: [AuthenticationFactory],
  });

  it("should create", () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
