import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineHelpWrapperComponent } from './inline-help-wrapper.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../types/repeat-list/repeat-list.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

describe('InlineHelpWrapperComponent', () => {
  let spectator: Spectator<InlineHelpWrapperComponent>;
  const createHost = createComponentFactory({
    component: InlineHelpWrapperComponent,
    imports: [MatDialogModule, MatButtonModule],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
