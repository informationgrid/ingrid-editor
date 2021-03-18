import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let spectator: Spectator<SettingsComponent>;
  const createComponent = createComponentFactory(SettingsComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
