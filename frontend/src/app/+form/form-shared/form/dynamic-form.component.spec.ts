import {DynamicFormComponent} from './dynamic-form.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {FormularService} from '../../formular.service';
import {FormToolbarService} from '../toolbar/form-toolbar.service';
import {FormPluginsService} from '../form-plugins.service';
import {DocumentService} from '../../../services/document/document.service';
import {ModalService} from '../../../services/modal/modal.service';
import {RouterTestingModule} from '@angular/router/testing';
import {TreeService} from '../../sidebars/tree/tree.service';
import {AuthService} from '../../../services/security/auth.service';
import {PluginToken} from '../../../tokens/plugin.token';
import {AddressTitleBehaviour} from '../../../+catalog/+behaviours/system/AddressTitle/address-title.behaviour';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


describe('Dynamic Form', () => {

  let spectator: Spectator<DynamicFormComponent>;
  const createHost = createComponentFactory({
    component: DynamicFormComponent,
    imports: [RouterTestingModule, MatProgressSpinnerModule],
    providers: [
      {provide: PluginToken, useClass: AddressTitleBehaviour}
    ],
    mocks: [FormularService, FormToolbarService, FormPluginsService, DocumentService, ModalService, TreeService, AuthService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });

});
