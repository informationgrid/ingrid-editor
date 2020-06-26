import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseAddressDialogComponent } from './choose-address-dialog.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../repeat-list/repeat-list.component';

describe('ChooseAddressDialogComponent', () => {
  let spectator: Spectator<ChooseAddressDialogComponent>;
  const createHost = createComponentFactory({
    component: ChooseAddressDialogComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
