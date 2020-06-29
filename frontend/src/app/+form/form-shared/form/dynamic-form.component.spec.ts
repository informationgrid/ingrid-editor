import {DynamicFormComponent} from './dynamic-form.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {FormularService} from '../../formular.service';
import {FormToolbarService} from '../toolbar/form-toolbar.service';
import {FormPluginsService} from '../form-plugins.service';
import {DocumentService} from '../../../services/document/document.service';
import {ModalService} from '../../../services/modal/modal.service';
import {RouterTestingModule} from '@angular/router/testing';


describe('Dynamic Form', () => {

  let spectator: Spectator<DynamicFormComponent>;
  const createHost = createComponentFactory({
    component: DynamicFormComponent,
    imports: [RouterTestingModule],
    mocks: [FormularService, FormToolbarService, FormPluginsService, DocumentService, ModalService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });

});
