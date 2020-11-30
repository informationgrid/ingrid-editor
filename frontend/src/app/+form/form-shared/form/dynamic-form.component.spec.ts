import {DynamicFormComponent} from './dynamic-form.component';
import {createComponentFactory, mockProvider, Spectator} from '@ngneat/spectator';
import {FormularService} from '../../formular.service';
import {FormToolbarService} from '../toolbar/form-toolbar.service';
import {FormPluginsService} from '../form-plugins.service';
import {DocumentService} from '../../../services/document/document.service';
import {ModalService} from '../../../services/modal/modal.service';
import {RouterTestingModule} from '@angular/router/testing';
import {TreeService} from '../../sidebars/tree/tree.service';
import {AuthService} from '../../../services/security/auth.service';
import {FormPluginToken} from '../../../tokens/plugin.token';
import {AddressTitleBehaviour} from '../../../+catalog/+behaviours/system/AddressTitle/address-title.behaviour';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule} from '@angular/material/dialog';
import {BehaviourService} from '../../../services/behavior/behaviour.service';
import {FormSharedModule} from '../form-shared.module';
import {of} from 'rxjs';


describe('Dynamic Form', () => {

  let spectator: Spectator<DynamicFormComponent>;
  const createHost = createComponentFactory({
    component: DynamicFormComponent,
    imports: [RouterTestingModule, MatProgressSpinnerModule, MatDialogModule],
    providers: [
      {provide: FormPluginToken, useClass: AddressTitleBehaviour, multi: true},
      mockProvider(FormToolbarService, {
        toolbar$: of([])
      })
    ],
    mocks: [BehaviourService, FormSharedModule, FormularService, FormPluginsService,
      DocumentService, ModalService, TreeService, AuthService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });

});
