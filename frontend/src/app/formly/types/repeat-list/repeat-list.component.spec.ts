import {RepeatListComponent} from './repeat-list.component';
import {createHostFactory, SpectatorHost} from '@ngneat/spectator';
import {AddButtonComponent} from '../../../shared/add-button/add-button.component';
import {FormlyFieldConfig, FormlyForm, FormlyModule} from '@ngx-formly/core';
import {fakeAsync} from '@angular/core/testing';
import {RepeatDetailListComponent} from '../repeat-detail-list/repeat-detail-list.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormFieldsModule} from '../../../form-fields/form-fields.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';

describe('RepeatListComponent', () => {
  let spectator: SpectatorHost<FormlyForm>;
  const createHost = createHostFactory({
    component: FormlyForm,
    declarations: [RepeatDetailListComponent, AddButtonComponent],
    imports: [MatDialogModule, MatListModule, MatAutocompleteModule, MatSelectModule, MatFormFieldModule, FormFieldsModule,
      ReactiveFormsModule, FormlyMaterialModule, FormsModule,
      FormlyModule.forRoot({
        types: [
          {
            name: 'repeatListSimple',
            component: RepeatListComponent
          }
        ]
      })]
  });

  beforeEach(() => {
    spectator = createHost(`<formly-form [fields]="config"></formly-form>`, {
      hostProps: {
        config: [{
          key: 'repeatList',
          type: 'repeatListSimple',
          templateOptions: {}
        }] as FormlyFieldConfig[]
      }
    });
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });

  it('should add a simple value', fakeAsync(() => {

    spectator.detectChanges();

    let elements = spectator.queryAll('mat-list-item');
    expect(elements.length).toBe(0);

    spectator.typeInElement('test-simple', '.mat-autocomplete-trigger');
    // spectator.keyboard.pressEnter('.mat-input-element');
    spectator.debugElement.query(By.css('.mat-autocomplete-trigger')).triggerEventHandler('keydown.enter', {});
    elements = spectator.queryAll('mat-list-item');
    expect(elements.length).toBe(1);

  }));

  xit('should remove a simple value', () => {
    expect(spectator).toBeTruthy();
  });

  xit('should show a codelist and select an item', () => {
    /*spectator.component.to.options = of([
      {label: 'a', value: 'a'},
      {label: 'b', value: 'b'},
      {label: 'c', value: 'c'}
    ]);*/

    spectator.detectChanges();

    // spectator.query()
  });
});
