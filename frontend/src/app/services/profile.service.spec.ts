import {ProfileService} from './profile.service';
import {createServiceFactory, mockProvider, SpectatorService} from '@ngneat/spectator';
import {ConfigService, UserInfo} from './config/config.service';
import {BehaviorSubject} from 'rxjs';
import {ContextHelpService} from './context-help/context-help.service';
import {ModalService} from './modal/modal.service';
import {Catalog} from '../+catalog/services/catalog.model';

describe('ProfileService', () => {
  let spectator: SpectatorService<ProfileService>;
  const createService = createServiceFactory({
    service: ProfileService,
    providers: [
      mockProvider(ConfigService, {
        $userInfo: new BehaviorSubject<UserInfo>({
          assignedCatalogs: [],
          currentCatalog: new Catalog({}),
          name: 'x',
          firstName: 'x',
          lastName: 'x',
          roles: [],
          userId: 'y',
          version: null,
          lastLogin: new Date()
        })
      })
    ],
    mocks: [ContextHelpService, ModalService]
  });

  beforeEach(() => {
    spectator = createService();
  });

  it('should get catalogs', () => {

    expect(spectator.service.getProfiles().length).toBe(0);

  });
});
