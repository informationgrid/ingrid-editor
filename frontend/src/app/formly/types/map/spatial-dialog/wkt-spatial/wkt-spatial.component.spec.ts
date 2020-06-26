import {WktSpatialComponent} from './wkt-spatial.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';

describe('WktSpatialComponent', () => {
  let spectator: Spectator<WktSpatialComponent>;
  const createHost = createComponentFactory({
    component: WktSpatialComponent,
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });

});
