import {createComponentFactory, Spectator} from '@ngneat/spectator';

import {DateRangeTypeComponent} from './date-range-type.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';

describe('DateRangeTypeComponent', () => {
  let spectator: Spectator<DateRangeTypeComponent>;
  const createComponent = createComponentFactory({
    component: DateRangeTypeComponent,
    imports: [FormsModule, ReactiveFormsModule, MatDatepickerModule, MatNativeDateModule]
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
