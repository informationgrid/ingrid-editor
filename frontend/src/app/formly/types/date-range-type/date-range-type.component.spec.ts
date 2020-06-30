import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { DateRangeTypeComponent } from './date-range-type.component';

describe('DateRangeTypeComponent', () => {
  let spectator: Spectator<DateRangeTypeComponent>;
  const createComponent = createComponentFactory(DateRangeTypeComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
