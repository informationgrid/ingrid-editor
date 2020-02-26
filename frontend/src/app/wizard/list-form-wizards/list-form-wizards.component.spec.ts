import {async} from '@angular/core/testing';

import {ListFormWizardsComponent} from './list-form-wizards.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {MatDialogModule} from '@angular/material/dialog';
import {BreadcrumbComponent} from '../../+form/form-info/breadcrumb/breadcrumb.component';

describe('ListFormWizardsComponent', () => {
  let spectator: Spectator<ListFormWizardsComponent>;
  const createHost = createComponentFactory({
    component: ListFormWizardsComponent,
    imports: [],
    declarations: [],
    componentMocks: [],
    detectChanges: false
  });

  beforeEach(async(() => {
    spectator = createHost();
  }))

  it('should be created', () => {
    expect(spectator.component).toBeTruthy();
  });
});
