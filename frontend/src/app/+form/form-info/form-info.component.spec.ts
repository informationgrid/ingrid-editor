import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInfoComponent } from './form-info.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../formly/types/repeat-list/repeat-list.component';

describe('FormInfoComponent', () => {
  let spectator: Spectator<FormInfoComponent>;
  const createHost = createComponentFactory({
    component: FormInfoComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
