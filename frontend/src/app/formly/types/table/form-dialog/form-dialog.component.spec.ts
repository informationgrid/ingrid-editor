import {FormDialogComponent} from './form-dialog.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import {MatRadioModule} from '@angular/material/radio';
import {MatFormFieldModule} from '@angular/material/form-field';

describe('FormDialogComponent', () => {
  let spectator: Spectator<FormDialogComponent>;
  const createHost = createComponentFactory({
    component: FormDialogComponent,
    providers: [
      {provide: MAT_DIALOG_DATA, useValue: {model: {}}}
    ],
    imports: [MatTabsModule, MatRadioModule, MatFormFieldModule, MatDialogModule],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
