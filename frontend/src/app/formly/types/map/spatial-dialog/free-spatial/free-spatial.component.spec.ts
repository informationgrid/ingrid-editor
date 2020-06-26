import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeSpatialComponent } from './free-spatial.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../../repeat-list/repeat-list.component';

describe('FreeSpatialComponent', () => {
  let spectator: Spectator<FreeSpatialComponent>;
  const createHost = createComponentFactory({
    component: FreeSpatialComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
