import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { NewUserDialogComponent } from './new-user-dialog.component';

describe('NewUserDialogComponent', () => {
  let spectator: Spectator<NewUserDialogComponent>;
  const createComponent = createComponentFactory(NewUserDialogComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
