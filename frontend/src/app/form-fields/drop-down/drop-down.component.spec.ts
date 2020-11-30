import {DropDownComponent} from './drop-down.component';
import {createComponentFactory, Spectator} from '@ngneat/spectator';
import {MatFormFieldModule} from '@angular/material/form-field';
import {DocumentService} from '../../services/document/document.service';
import {Router} from '@angular/router';
import {MatSelectModule} from '@angular/material/select';

describe('DropDownComponent', () => {

  let spectator: Spectator<DropDownComponent>;
  const createComponent = createComponentFactory({
    component: DropDownComponent,
    imports: [MatFormFieldModule, MatSelectModule],
    mocks: [DocumentService, Router]
  });

  it('should create', () => {
    spectator = createComponent();

    expect(spectator.component).toBeTruthy();
  });
});
