import {Spectator, createComponentFactory} from '@ngneat/spectator';

import {SettingsComponent} from './settings.component';
import {RouterTestingModule} from '@angular/router/testing';
import {TestBed} from '@angular/core/testing';

describe('SettingsComponent', () => {
  let spectator: Spectator<SettingsComponent>;
  const createComponent = createComponentFactory({
    component: SettingsComponent,
    imports: [RouterTestingModule]
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(
          [{
            path: 'settings',
            children: [{
              path: 'general',
              component: SettingsComponent,
              data: {index: 0}
            }]
          }]
        )
      ]
    });
  });

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
