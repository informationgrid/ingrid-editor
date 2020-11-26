import { waitForAsync } from '@angular/core/testing';

import {ListFormWizardsComponent} from './list-form-wizards.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {DocumentService} from '../../services/document/document.service';

describe('ListFormWizardsComponent', () => {
  let spectator: Spectator<ListFormWizardsComponent>;
  const createHost = createComponentFactory({
    component: ListFormWizardsComponent,
    imports: [],
    mocks: [DocumentService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
