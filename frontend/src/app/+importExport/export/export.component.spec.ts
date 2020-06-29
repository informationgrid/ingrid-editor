import {ExportComponent} from './export.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTabsModule} from '@angular/material/tabs';
import {MatRadioModule} from '@angular/material/radio';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {ImportExportService} from '../import-export-service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';

describe('ExportComponent', () => {
  let spectator: Spectator<ExportComponent>;
  const createHost = createComponentFactory({
    component: ExportComponent,
    imports: [ReactiveFormsModule, MatTabsModule, MatRadioModule, MatDatepickerModule, MatFormFieldModule, MatStepperModule, FormsModule],
    mocks: [ImportExportService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
