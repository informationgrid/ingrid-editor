import { Spectator, createComponentFactory } from '@ngneat/spectator';

import { RepeatDetailListComponent } from './repeat-detail-list.component';
import {MatDialogModule} from '@angular/material/dialog';

describe('RepeatDetailListComponent', () => {
  let spectator: Spectator<RepeatDetailListComponent>;
  const createComponent = createComponentFactory({
    component: RepeatDetailListComponent,
    imports: [MatDialogModule]
  });

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
