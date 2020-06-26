import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressCardComponent } from './address-card.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../repeat-list/repeat-list.component';

describe('AddressCardComponent', () => {
  let spectator: Spectator<AddressCardComponent>;
  const createHost = createComponentFactory({
    component: AddressCardComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
