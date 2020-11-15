import { waitForAsync } from '@angular/core/testing';

import {ListFormWizardsComponent} from './list-form-wizards.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {MatDialogModule} from '@angular/material/dialog';
import {BreadcrumbComponent} from '../../+form/form-info/breadcrumb/breadcrumb.component';
import {RepeatListComponent} from '../../formly/types/repeat-list/repeat-list.component';

describe('ListFormWizardsComponent', () => {
  let spectator: Spectator<ListFormWizardsComponent>;
  const createHost = createComponentFactory({
    component: ListFormWizardsComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
