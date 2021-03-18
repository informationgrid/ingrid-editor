import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { GeneralSettingsComponent } from './general-settings.component';

describe('GeneralSettingsComponent', () => {
  let spectator: Spectator<GeneralSettingsComponent>;
  const createComponent = createComponentFactory(GeneralSettingsComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
