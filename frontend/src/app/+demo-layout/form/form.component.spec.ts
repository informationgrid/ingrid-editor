import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormComponent } from './form.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../formly/types/repeat-list/repeat-list.component';

describe('FormComponent', () => {
  let spectator: Spectator<FormComponent>;
  const createHost = createComponentFactory({
    component: FormComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
