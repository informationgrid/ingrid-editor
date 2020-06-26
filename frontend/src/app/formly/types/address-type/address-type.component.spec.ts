import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressTypeComponent } from './address-type.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../repeat-list/repeat-list.component';

describe('AddressTypeComponent', () => {
  let spectator: Spectator<AddressTypeComponent>;
  const createHost = createComponentFactory({
    component: AddressTypeComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
