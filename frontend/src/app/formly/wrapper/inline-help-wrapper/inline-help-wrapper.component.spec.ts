import {InlineHelpWrapperComponent} from './inline-help-wrapper.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {ConfigService} from '../../../services/config/config.service';
import {ContextHelpService} from '../../../services/context-help/context-help.service';

describe('InlineHelpWrapperComponent', () => {
  let spectator: Spectator<InlineHelpWrapperComponent>;
  const createHost = createComponentFactory({
    component: InlineHelpWrapperComponent,
    imports: [MatDialogModule, MatButtonModule],
    mocks: [ConfigService, ContextHelpService],
    detectChanges: false
  });

  beforeEach(() => {
    spectator = createHost();
  })

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
