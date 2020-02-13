import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { QuickSearchComponent } from './quick-search.component';

describe('QuickSearchComponent', () => {
  let spectator: Spectator<QuickSearchComponent>;
  const createComponent = createComponentFactory(QuickSearchComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
