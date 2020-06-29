import {AddUserDialogComponent} from './add-user-dialog.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {UserService} from '../../../services/user/user.service';
import {MatTabsModule} from '@angular/material/tabs';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';

describe('AddUserDialogComponent', () => {
  let spectator: Spectator<AddUserDialogComponent>;
  const createHost = createComponentFactory({
    component: AddUserDialogComponent,
    imports: [MatTabsModule, MatDialogModule, MatListModule],
    providers: [
      {provide: MAT_DIALOG_DATA, useValue: []}
    ],
    mocks: [UserService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
