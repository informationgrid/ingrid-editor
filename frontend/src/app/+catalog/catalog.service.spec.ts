import {CatalogService} from './services/catalog.service';
import {createServiceFactory, mockProvider, SpectatorService} from '@ngneat/spectator';
import {Router} from '@angular/router';
import {CatalogDataService} from './services/catalog-data.service';
import {HttpClient} from '@angular/common/http';
import {ConfigService, Configuration} from '../services/config/config.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('CatalogService', () => {
  let spectator: SpectatorService<CatalogService>;
  const createService = createServiceFactory({
    service: CatalogService,
    imports: [HttpClientTestingModule],
    providers: [
      mockProvider(ConfigService, {
        getConfiguration: () => new Configuration('/keycloak', '/api', null)
      })
    ],
    mocks: [Router, CatalogDataService]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should get catalogs', () => {

    spectator.service.getCatalogs()
      .subscribe(catalogs => expect(catalogs.length).toBeEmpty());

  });
});
