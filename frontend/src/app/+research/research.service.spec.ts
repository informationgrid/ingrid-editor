import {ResearchService} from './research.service';
import {createServiceFactory, SpectatorService} from '@ngneat/spectator';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ConfigService} from '../services/config/config.service';

describe('ResearchService', () => {
  let spectator: SpectatorService<ResearchService>;
  const createService = createServiceFactory({
    service: ResearchService,
    imports: [HttpClientTestingModule],
    providers: [],
    entryComponents: [],
    mocks: [ConfigService]
  });

  beforeEach(() => spectator = createService());

  it('should be created', () => {
    expect(spectator.service).toBeTruthy();
  });
});
