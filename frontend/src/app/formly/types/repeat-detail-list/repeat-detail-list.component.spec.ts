import {createHostFactory, SpectatorHost} from '@ngneat/spectator';

import {RepeatDetailListComponent} from './repeat-detail-list.component';
import {FormlyFieldConfig, FormlyForm, FormlyModule} from '@ngx-formly/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';
import {AddButtonComponent} from '../../../shared/add-button/add-button.component';

describe('RepeatDetailListComponent', () => {
  let spectator: SpectatorHost<FormlyForm>;
  const createHost = createHostFactory({
    component: FormlyForm,
    declarations: [RepeatDetailListComponent, AddButtonComponent],
    imports: [MatDialogModule, MatListModule, FormlyModule.forRoot({
      types: [
        {
          name: 'repeatDetailList',
          component: RepeatDetailListComponent
        }
      ]
    })]
  });

  beforeEach(() => {
    spectator = createHost(`<formly-form [fields]="config"></formly-form>`, {
      hostProps: {
        config: [{
          key: 'repeatField',
          type: 'repeatDetailList',
          templateOptions: {},
          fieldArray: {
            fieldGroup: [
              {
                key: 'type',
                type: 'input',
                templateOptions: {
                  label: 'Typ',
                  appearance: 'outline'
                }
              }
            ]
          }
        }] as FormlyFieldConfig[]
      }
    });
  });

  it('should create', () => {

    expect(spectator.component).toBeTruthy();
  });
});
