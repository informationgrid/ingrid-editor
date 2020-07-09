import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { SessionTimeoutInfoComponent } from './session-timeout-info.component';

describe('SessionTimeoutInfoComponent', () => {
  let spectator: Spectator<SessionTimeoutInfoComponent>;
  const createComponent = createComponentFactory(SessionTimeoutInfoComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
