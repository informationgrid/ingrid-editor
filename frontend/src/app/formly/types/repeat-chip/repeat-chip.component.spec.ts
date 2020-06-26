import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatChipComponent } from './repeat-chip.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../repeat-list/repeat-list.component';

describe('RepeatChipComponent', () => {
  let spectator: Spectator<RepeatChipComponent>;
  const createHost = createComponentFactory({
    component: RepeatChipComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
