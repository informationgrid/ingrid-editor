import {AddressCardComponent} from './address-card.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {MatCardModule} from '@angular/material/card';
import {CodelistPipe} from '../../../../directives/codelist.pipe';
import {CodelistService} from '../../../../services/codelist/codelist.service';

describe('AddressCardComponent', () => {
  let spectator: Spectator<AddressCardComponent>;
  const createHost = createComponentFactory({
    component: AddressCardComponent,
    imports: [MatCardModule],
    declarations: [CodelistPipe],
    componentMocks: [CodelistService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
