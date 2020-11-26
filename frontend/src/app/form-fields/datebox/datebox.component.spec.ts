import {DateboxComponent} from './datebox.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';

describe('DateboxComponent', () => {

  let spectator: Spectator<DateboxComponent>;
  const createComponent = createComponentFactory({
    component: DateboxComponent,
    imports: [],
    detectChanges: false
  });

  beforeEach(() => spectator = createComponent());

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });

});
