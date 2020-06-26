import {FreeSpatialComponent} from './free-spatial.component';
import {createComponentFactory, mockProvider, Spectator} from '@ngneat/spectator';
import {NominatimService} from '../../nominatim.service';

describe('FreeSpatialComponent', () => {
  let spectator: Spectator<FreeSpatialComponent>;
  const createHost = createComponentFactory({
    component: FreeSpatialComponent,
    providers: [
      mockProvider(NominatimService)
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
