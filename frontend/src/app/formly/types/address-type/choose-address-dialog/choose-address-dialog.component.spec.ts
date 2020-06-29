import {ChooseAddressDialogComponent} from './choose-address-dialog.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import {MatRadioModule} from '@angular/material/radio';
import {MatFormFieldModule} from '@angular/material/form-field';
import {CodelistService} from '../../../../services/codelist/codelist.service';
import {MatSelectModule} from '@angular/material/select';

describe('ChooseAddressDialogComponent', () => {
  let spectator: Spectator<ChooseAddressDialogComponent>;
  const createHost = createComponentFactory({
    component: ChooseAddressDialogComponent,
    providers: [
      {provide: MAT_DIALOG_DATA, useValue: {}}
    ],
    imports: [MatDialogModule, MatTabsModule, MatRadioModule, MatFormFieldModule, MatSelectModule],
    mocks: [CodelistService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
