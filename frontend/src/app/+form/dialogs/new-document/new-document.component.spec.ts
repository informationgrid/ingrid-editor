import {async} from '@angular/core/testing';

import {NewDocumentComponent} from './new-document.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {BreadcrumbComponent} from '../../form-info/breadcrumb/breadcrumb.component';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

describe('NewDocumentComponent', () => {
  let spectator: Spectator<NewDocumentComponent>;
  const createHost = createComponentFactory({
    component: NewDocumentComponent,
    imports: [],
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
});
