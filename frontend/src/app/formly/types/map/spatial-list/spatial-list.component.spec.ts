import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpatialListComponent } from './spatial-list.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../repeat-list/repeat-list.component';

describe('SpatialListComponent', () => {
  let spectator: Spectator<SpatialListComponent>;
  const createHost = createComponentFactory({
    component: SpatialListComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
