import {AddressComponent} from './address.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {Router} from '@angular/router';
import {FormPluginsService} from '../../+form/form-shared/form-plugins.service';
import {FormularService} from '../../+form/formular.service';

describe('AddressComponent', () => {
  let spectator: Spectator<AddressComponent>;
  const createComponent = createComponentFactory({
      component: AddressComponent,
      imports: [],
      providers: [],
      componentMocks: [Router, FormPluginsService, FormularService]
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
