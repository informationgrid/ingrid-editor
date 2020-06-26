import {ProfileService} from './profile.service';
import {createServiceFactory, mockProvider, SpectatorService} from '@ngneat/spectator';
import {ConfigService} from './config/config.service';
import {BehaviorSubject} from 'rxjs';
import {ContextHelpService} from './context-help/context-help.service';
import {ModalService} from './modal/modal.service';

describe('ProfileService', () => {
  let spectator: SpectatorService<ProfileService>;
  const createService = createServiceFactory({
    service: ProfileService,
    providers: [
      mockProvider(ConfigService, {
        $userInfo: new BehaviorSubject({})
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
