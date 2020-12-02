import {AddressDashboardComponent} from './address-dashboard.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {RouterTestingModule} from '@angular/router/testing';
import {FormToolbarService} from '../../+form/form-shared/toolbar/form-toolbar.service';
import {DocumentService} from '../../services/document/document.service';

describe('AddressDashboardComponent', () => {
  let spectator: Spectator<AddressDashboardComponent>;
  const createHost = createComponentFactory({
    component: AddressDashboardComponent,
    imports: [RouterTestingModule],
    mocks: [FormToolbarService, DocumentService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
