import {IndexingComponent} from './indexing.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {IndexService} from './index.service';

describe('IndexingComponent', () => {

  let spectator: Spectator<IndexingComponent>;
  const createHost = createComponentFactory({
    component: IndexingComponent,
    imports: [],
    componentMocks: [IndexService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
