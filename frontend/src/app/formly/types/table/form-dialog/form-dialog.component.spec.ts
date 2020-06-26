import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDialogComponent } from './form-dialog.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../repeat-list/repeat-list.component';

describe('FormDialogComponent', () => {
  let spectator: Spectator<FormDialogComponent>;
  const createHost = createComponentFactory({
    component: FormDialogComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
