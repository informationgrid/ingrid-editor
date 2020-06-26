import {CatalogsComponent} from './catalogs.component';
import {createComponentFactory, mockProvider, Spectator} from '@ngneat/spectator';
import {Router} from '@angular/router';
import {CatalogService} from '../services/catalog.service';
import {MatDialogModule} from '@angular/material/dialog';

describe('CatalogsComponent', () => {
  let spectator: Spectator<CatalogsComponent>;
  const createHost = createComponentFactory({
    component: CatalogsComponent,
    imports: [MatDialogModule],
    providers: [
      mockProvider(Router),
      mockProvider(CatalogService),
    ],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
