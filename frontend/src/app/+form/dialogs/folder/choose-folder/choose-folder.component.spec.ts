import {async} from '@angular/core/testing';

import {ChooseFolderComponent} from './choose-folder.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {MatDialogModule} from '@angular/material/dialog';
import {BreadcrumbComponent} from '../../../form-info/breadcrumb/breadcrumb.component';

describe('ChooseFolderComponent', () => {
  let spectator: Spectator<ChooseFolderComponent>;
  const createHost = createComponentFactory({
    component: ChooseFolderComponent,
    imports: [MatDialogModule],
    declarations: [BreadcrumbComponent],
    componentMocks: [],
    detectChanges: false
  });

  beforeEach(async(() => {
    spectator = createHost();
  }))

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  xit('should create a folder below a different selected one', () => {
    // the breadcrumb must change accordingly!
  });
});
