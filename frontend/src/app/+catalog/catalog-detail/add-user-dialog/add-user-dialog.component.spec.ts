import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserDialogComponent } from './add-user-dialog.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../../formly/types/repeat-list/repeat-list.component';

describe('AddUserDialogComponent', () => {
  let spectator: Spectator<AddUserDialogComponent>;
  const createHost = createComponentFactory({
    component: AddUserDialogComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
