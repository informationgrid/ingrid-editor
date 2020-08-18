import {RepeatListComponent} from './repeat-list.component';
import {createHostFactory, SpectatorHost} from '@ngneat/spectator';
import {AddButtonComponent} from '../../../shared/add-button/add-button.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {SelectOptionPipe} from '../../../directives/selectOption.pipe';
import {FormlyFieldConfig, FormlyForm, FormlyFormBuilder, FormlyModule} from '@ngx-formly/core';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {CommonModule} from '@angular/common';
import {FormFieldsModule} from '../../../form-fields/form-fields.module';
import {FormlyMatInputModule} from '@ngx-formly/material/input';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {MatIconTestingModule} from '@angular/material/icon/testing';
import {fakeAsync, tick} from '@angular/core/testing';

const formlyTemplate = `
        <form [formGroup]="form">
            <formly-form [form]="form" [fields]="fields" [model]="model"></formly-form>
        </form>`;

const simpleRepeatListProps = {
  form: new FormGroup({}),
  fields: <FormlyFieldConfig[]>[{
    key: 'repeatListSimple',
    type: 'repeatList',
    templateOptions: {
      externalLabel: 'Mehrfacheingabe (Simple)',
      placeholder: 'Bitte etwas eingeben'
    }
  }],
  model: {repeatListSimple: []}
};


describe('RepeatListComponent', () => {
  let spectator: SpectatorHost<FormlyForm>;

  const createHost = createHostFactory({
    component: FormlyForm,
    imports: [
      CommonModule, BrowserModule, FormlyMaterialModule, FormFieldsModule, FormlyMatInputModule, NoopAnimationsModule,
      MatAutocompleteModule, MatSelectModule, MatListModule, MatFormFieldModule,
      ReactiveFormsModule, MatInputModule, MatIconTestingModule,
      FormlyModule.forRoot({
        types: [
          {
            name: 'repeatList',
            component: RepeatListComponent
          }
        ]
      })],
    declarations: [AddButtonComponent, SelectOptionPipe, RepeatListComponent],
    providers: [
      FormlyFormBuilder
    ],
    detectChanges: true
  });

  it('should create', () => {
    spectator = createHost(formlyTemplate);
    expect(spectator).toBeTruthy();
  });

  it('should add a simple value', fakeAsync(() => {

    spectator = createHost(formlyTemplate, {
      hostProps: simpleRepeatListProps
    });

    // spectator.detectChanges();

    let elements = spectator.queryAll('mat-list-item');
    expect(elements.length).toBe(0);

    spectator.hostFixture.whenStable().then(() => {
      spectator.typeInElement('test-simple', '.mat-autocomplete-trigger');
      spectator.hostFixture.whenStable().then(() => {
        spectator.keyboard.pressEnter();

        spectator.detectChanges();

        elements = spectator.queryAll('mat-list-item');
        expect(elements.length).toBe(1);
      });
    })

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
