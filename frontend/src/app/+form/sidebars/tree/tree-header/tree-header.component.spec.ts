import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeHeaderComponent } from './tree-header.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../../../formly/types/repeat-list/repeat-list.component';

describe('TreeHeaderComponent', () => {
  let spectator: Spectator<TreeHeaderComponent>;
  const createHost = createComponentFactory({
    component: TreeHeaderComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
