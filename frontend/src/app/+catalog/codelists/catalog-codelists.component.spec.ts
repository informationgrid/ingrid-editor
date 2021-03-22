import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CatalogCodelistsComponent } from './catalog-codelists.component';
import {createComponentFactory, mockProvider, Spectator} from '@ngneat/spectator';
import {RepeatListComponent} from '../../formly/types/repeat-list/repeat-list.component';
import {MatDialogModule} from '@angular/material/dialog';
import {CodelistService} from '../../services/codelist/codelist.service';

describe('CodelistsComponent', () => {
  let spectator: Spectator<CatalogCodelistsComponent>;
  const createHost = createComponentFactory({
    component: CatalogCodelistsComponent,
    imports: [MatDialogModule],
    providers: [
      mockProvider(CodelistService)
    ],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
