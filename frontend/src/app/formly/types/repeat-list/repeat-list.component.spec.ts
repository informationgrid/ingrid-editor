import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatListComponent } from './repeat-list.component';
import {createComponentFactory, mockProvider, Spectator} from '@ngneat/spectator';
import {SpatialDialogComponent} from '../map/spatial-dialog/spatial-dialog.component';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormFieldsModule} from '../../../form-fields/form-fields.module';
import {AddButtonComponent} from '../../../shared/add-button/add-button.component';
import {FormSharedModule} from '../../../+form/form-shared/form-shared.module';
import {SharedModule} from '../../../shared/shared.module';

describe('RepeatListComponent', () => {
  let spectator: Spectator<RepeatListComponent>;
  const createHost = createComponentFactory({
    component: RepeatListComponent,
    imports: [SharedModule],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
