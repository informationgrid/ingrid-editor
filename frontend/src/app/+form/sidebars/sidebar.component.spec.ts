import {SidebarComponent} from './sidebar.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {Router} from '@angular/router';

describe('SidebarComponent', () => {
  let spectator: Spectator<SidebarComponent>;
  const createHost = createComponentFactory({
    component: SidebarComponent,
    mocks: [Router],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
