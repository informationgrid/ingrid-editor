import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormLabelComponent } from './form-label.component';
import {createComponentFactory, mockProvider, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../types/repeat-list/repeat-list.component';
import {MatDialog} from '@angular/material/dialog';

describe('FormLabelComponent', () => {
  let spectator: Spectator<FormLabelComponent>;
  const createHost = createComponentFactory({
    component: FormLabelComponent,
    providers: [
      mockProvider(MatDialog)
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
