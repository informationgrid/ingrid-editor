import {TreeHeaderComponent} from './tree-header.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {DynamicDatabase} from '../dynamic.database';

describe('TreeHeaderComponent', () => {
  let spectator: Spectator<TreeHeaderComponent>;
  const createHost = createComponentFactory({
    component: TreeHeaderComponent,
    componentMocks: [DynamicDatabase],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
