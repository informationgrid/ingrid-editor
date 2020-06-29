import {FormInfoComponent} from './form-info.component';
import {createComponentFactory, mockProvider, Spectator} from '@ngneat/spectator';
import {ProfileService} from '../../services/profile.service';

describe('FormInfoComponent', () => {
  let spectator: Spectator<FormInfoComponent>;
  let configService: ProfileService;

  const createHost = createComponentFactory({
    component: FormInfoComponent,
    providers: [
      mockProvider(ProfileService)
    ],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
    configService = spectator.inject(ProfileService);
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
