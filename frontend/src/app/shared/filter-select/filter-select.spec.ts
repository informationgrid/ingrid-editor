import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { FilterSelectComponent } from './filter-select.component';

describe('OptionListComponent', () => {
  let spectator: Spectator<FilterSelectComponent>;
  const createComponent = createComponentFactory(FilterSelectComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
