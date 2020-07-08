import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { RepeatDetailListComponent } from './repeat-detail-list.component';

describe('RepeatDetailListComponent', () => {
  let spectator: Spectator<RepeatDetailListComponent>;
  const createComponent = createComponentFactory(RepeatDetailListComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
