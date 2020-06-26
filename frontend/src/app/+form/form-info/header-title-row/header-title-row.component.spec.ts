import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderTitleRowComponent } from './header-title-row.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../../formly/types/repeat-list/repeat-list.component';

describe('HeaderTitleRowComponent', () => {
  let spectator: Spectator<HeaderTitleRowComponent>;
  const createHost = createComponentFactory({
    component: HeaderTitleRowComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
