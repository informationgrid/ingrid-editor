import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportComponent } from './export.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../formly/types/repeat-list/repeat-list.component';

describe('ExportComponent', () => {
  let spectator: Spectator<ExportComponent>;
  const createHost = createComponentFactory({
    component: ExportComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
