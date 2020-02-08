import {async} from '@angular/core/testing';

import {CatalogDetailComponent} from './catalog-detail.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {UserService} from '../../services/user/user.service';
import {CatalogService} from '../services/catalog.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatListModule} from '@angular/material/list';

describe('CatalogDetailComponent', () => {
  let spectator: Spectator<CatalogDetailComponent>;
  const createHost = createComponentFactory({
    component: CatalogDetailComponent,
    imports: [MatDialogModule, MatFormFieldModule, MatListModule],
    providers: [{
      provide: MatDialogRef, useValue: {}
    },
      {provide: MAT_DIALOG_DATA, useValue: []}
    ],
    componentMocks: [UserService, CatalogService],
    detectChanges: false
  });

  beforeEach(async(() => {
    spectator = createHost();
  }));

  fit('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
