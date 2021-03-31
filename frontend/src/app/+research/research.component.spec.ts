import {ResearchComponent} from './research.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {ResearchService} from './research.service';
import {RouterTestingModule} from '@angular/router/testing';
import {LeafletService} from '../formly/types/map/leaflet.service';
import {ProfileService} from '../services/profile.service';

describe('ResearchComponent', () => {
  let spectator: Spectator<ResearchComponent>;
  const createComponent = createComponentFactory({
    component: ResearchComponent,
    imports: [RouterTestingModule],
    declarations: [],
    componentMocks: [],
    /*providers: [mockProvider(ResearchService, {
      getQuickFilter(): Observable<FacetGroup[]> {
        return of([]);
      }
    })],*/
    mocks: [ResearchService, LeafletService, ProfileService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createComponent();
  });
  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
