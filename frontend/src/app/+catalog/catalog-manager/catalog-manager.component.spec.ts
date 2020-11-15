import {CatalogManagerComponent} from './catalog-manager.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatListModule} from '@angular/material/list';
import {UserService} from '../../services/user/user.service';
import {CatalogService} from '../services/catalog.service';
import {ConfigService, UserInfo} from '../../services/config/config.service';
import {CatalogQuery} from '../../store/catalog/catalog.query';
import {BehaviorSubject, of} from 'rxjs';
import {RouterTestingModule} from '@angular/router/testing';
import { waitForAsync } from '@angular/core/testing';

describe('CatalogManagerComponent', () => {
  let spectator: Spectator<CatalogManagerComponent>;
  const createHost = createComponentFactory({
    component: CatalogManagerComponent,
    imports: [RouterTestingModule, MatDialogModule, MatFormFieldModule, MatListModule],
    providers: [
      {
        provide: MatDialogRef, useValue: {}
      },
      {provide: MAT_DIALOG_DATA, useValue: []}
    ],
    componentMocks: [CatalogQuery],
    mocks: [CatalogService, UserService, ConfigService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it('should create', () => {
    spectator.get(CatalogService).getCatalogs.andReturn(of([]));
    spectator.get(ConfigService).$userInfo = new BehaviorSubject<UserInfo>(<UserInfo>{
      assignedCatalogs: [],
      currentCatalog: {id: 'xxx'},
      name: '',
      firstName: '',
      lastName: '',
      roles: [],
      userId: ''
    });

    spectator.detectChanges();

    expect(spectator.component).toBeTruthy();
  });
});
