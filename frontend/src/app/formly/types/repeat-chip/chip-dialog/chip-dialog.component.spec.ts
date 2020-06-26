import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipDialogComponent } from './chip-dialog.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../repeat-list/repeat-list.component';

describe('ChipDialogComponent', () => {
  let spectator: Spectator<ChipDialogComponent>;
  const createHost = createComponentFactory({
    component: ChipDialogComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
