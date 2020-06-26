import {ChooseAddressDialogComponent} from './choose-address-dialog.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {MatDialogModule} from '@angular/material/dialog';

describe('ChooseAddressDialogComponent', () => {
  let spectator: Spectator<ChooseAddressDialogComponent>;
  const createHost = createComponentFactory({
    component: ChooseAddressDialogComponent,
    imports: [MatDialogModule],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
