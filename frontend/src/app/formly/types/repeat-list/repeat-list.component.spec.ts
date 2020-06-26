import {RepeatListComponent} from './repeat-list.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {SharedModule} from '../../../shared/shared.module';
import {AddButtonComponent} from '../../../shared/add-button/add-button.component';

describe('RepeatListComponent', () => {
  let spectator: Spectator<RepeatListComponent>;
  const createHost = createComponentFactory({
    component: RepeatListComponent,
    imports: [SharedModule],
    declarations: [AddButtonComponent],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
    spectator.component.field = {};
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
