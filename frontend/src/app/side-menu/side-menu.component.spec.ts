import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SideMenuComponent } from './side-menu.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../formly/types/repeat-list/repeat-list.component';

describe('SideMenuComponent', () => {
  let spectator: Spectator<SideMenuComponent>;
  const createHost = createComponentFactory({
    component: SideMenuComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
