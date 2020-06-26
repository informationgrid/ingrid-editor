import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTileComponent } from './document-tile.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../formly/types/repeat-list/repeat-list.component';

describe('DocumentTileComponent', () => {
  let spectator: Spectator<DocumentTileComponent>;
  const createHost = createComponentFactory({
    component: DocumentTileComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
