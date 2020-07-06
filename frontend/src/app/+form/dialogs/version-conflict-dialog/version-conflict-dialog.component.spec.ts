import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { VersionConflictDialogComponent } from './version-conflict-dialog.component';

describe('VersionConflictDialogComponent', () => {
  let spectator: Spectator<VersionConflictDialogComponent>;
  const createComponent = createComponentFactory(VersionConflictDialogComponent);

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
