import {createComponentFactory, mockProvider, Spectator} from '@ngneat/spectator';

import {QuickSearchComponent} from './quick-search.component';
import {DocumentService} from '../../services/document/document.service';
import {Router} from '@angular/router';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

describe('QuickSearchComponent', () => {
  let spectator: Spectator<QuickSearchComponent>;
  const createComponent = createComponentFactory({
    component: QuickSearchComponent,
    imports: [MatAutocompleteModule],
    providers: [
      mockProvider(DocumentService),
      mockProvider(Router)
    ]
  });

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
