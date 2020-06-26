import {ChipDialogComponent} from './chip-dialog.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';

describe('ChipDialogComponent', () => {
  let spectator: Spectator<ChipDialogComponent>;
  const createHost = createComponentFactory({
    component: ChipDialogComponent,
    imports: [
      MatDialogModule, MatSelectModule, MatListModule
    ],
    providers: [
      {provide: MAT_DIALOG_DATA, useValue: []}
    ],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
