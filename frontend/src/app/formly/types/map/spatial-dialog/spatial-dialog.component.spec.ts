import {SpatialDialogComponent} from './spatial-dialog.component';
import {createComponentFactory, mockProvider, Spectator} from '@ngneat/spectator';
import {TreeComponent} from '../../../../+form/sidebars/tree/tree.component';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormFieldsModule} from '../../../../form-fields/form-fields.module';

describe('SpatialDialogComponent', () => {

  let spectator: Spectator<SpatialDialogComponent>;
  const createHost = createComponentFactory({
    component: SpatialDialogComponent,
    imports: [MatDialogModule, MatButtonModule,
      MatFormFieldModule, MatAutocompleteModule, FormFieldsModule],
    declarations: [],
    componentMocks: [],
    providers: [
      mockProvider(MatDialogRef),
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
