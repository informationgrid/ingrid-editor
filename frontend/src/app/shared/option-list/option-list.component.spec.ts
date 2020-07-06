import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { OptionListComponent } from './option-list.component';

describe('OptionListComponent', () => {
  let spectator: Spectator<OptionListComponent>;
  const createComponent = createComponentFactory(OptionListComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
