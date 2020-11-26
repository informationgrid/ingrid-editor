import {IndexService} from './index.service';
import {createServiceFactory, mockProvider, SpectatorService} from '@ngneat/spectator';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ConfigService} from '../../services/config/config.service';
import {BehaviorSubject} from 'rxjs';

describe('IndexService', () => {
  let spectator: SpectatorService<IndexService>;
  const createService = createServiceFactory({
    service: IndexService,
    imports: [HttpClientTestingModule],
    providers: [
      mockProvider(ConfigService, {
        $userInfo: new BehaviorSubject({})
      })
    ]
  });

  beforeEach(() => spectator = createService());

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });
});
