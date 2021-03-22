import {FacetsComponent} from './facets.component';
import {createComponentFactory, mockProvider, Spectator} from '@ngneat/spectator';
import {Observable, of} from 'rxjs';
import {FacetGroup, ResearchService} from '../research.service';
import {LeafletService} from '../../../formly/types/map/leaflet.service';
import {MatDialogModule} from '@angular/material/dialog';

describe('FacetsComponent', () => {
  let spectator: Spectator<FacetsComponent>;
  const createComponent = createComponentFactory({
    component: FacetsComponent,
    imports: [MatDialogModule],
    declarations: [],
    componentMocks: [],
    providers: [mockProvider(ResearchService, {
      getQuickFilter(): Observable<FacetGroup[]> {
        return of([]);
      }
    })],
    mocks: [LeafletService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });
});
