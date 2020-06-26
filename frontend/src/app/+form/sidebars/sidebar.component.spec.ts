import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../formly/types/repeat-list/repeat-list.component';

describe('SidebarComponent', () => {
  let spectator: Spectator<SidebarComponent>;
  const createHost = createComponentFactory({
    component: SidebarComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
