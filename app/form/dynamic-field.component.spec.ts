import {addProviders, inject, TestComponentBuilder} from '@angular/core/testing';
import {disableDeprecatedForms, provideForms} from '@angular/forms';
import {DynamicFieldComponent} from './dynamic-field.component';
import {FieldBase} from './controls/field-base';
import {TextboxField} from './controls/field-textbox';
import {FormularService} from '../services/formular/formular.service';
import {QuestionControlService} from '../services/question-control.service';
import {TextareaField} from './controls/field-textarea';
import {DropdownField} from './controls/field-dropdown';
import {TableField} from './controls/field-table';
import {CheckboxField} from './controls/field-checkbox';
import {RadioField} from './controls/field-radio';
import {fakeAsync} from '@angular/core/testing/fake_async';

interface CallbackFunction {
  (comp: DynamicFieldComponent, element: Element, fixture: any): void;
}

describe( 'Formular fields', () => {

  let formFieldService = new QuestionControlService();
  // jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

  beforeEach( () => {
    addProviders(
      [
        disableDeprecatedForms(),
        provideForms(),
        FormularService
      ] );
  } );

  // specs
  it( 'should create a text field', initComp( (comp, element, fixture) => {
    let textfield: FieldBase<any> = new TextboxField( {
      key: 'ctrl1',
      label: 'Titel of ctrl1'
    } );

    comp.form = formFieldService.toFormGroup( [textfield] );
    comp.field = textfield;
    comp.value = {ctrl1: 'This is a textbox'};
    comp.parentKey = null;

    fixture.detectChanges(); // trigger change detection
    expect( (<HTMLElement>element.querySelector( 'label' )).innerText ).toBe( 'Titel of ctrl1' );
    expect( (<HTMLInputElement>element.querySelector( 'input' )).value ).toBe( 'This is a textbox' );
  } ) );

  it( 'should create a text area', initComp( (comp, element, fixture) => {
    let textareaField: FieldBase<any> = new TextareaField( {
      key: 'ctrl2',
      label: 'Titel of ctrl2'
    } );

    comp.form = formFieldService.toFormGroup( [textareaField] );
    comp.field = textareaField;
    comp.value = {ctrl2: 'This is a textarea'};
    comp.parentKey = null;

    fixture.detectChanges(); // trigger change detection
    expect( (<HTMLElement>element.querySelector( 'label' )).innerText ).toBe( 'Titel of ctrl2' );
    expect( (<HTMLTextAreaElement>element.querySelector( 'textarea' )).rows ).toBe( 3 );
    expect( (<HTMLInputElement>element.querySelector( 'textarea' )).value ).toBe( 'This is a textarea' );
  } ) );

  it( 'should create a text area with a defined number of rows', initComp( (comp, element, fixture) => {
    let textareaField: FieldBase<any> = new TextareaField( {
      key: 'ctrl2',
      label: 'Titel of ctrl2',
      rows: 10
    } );

    comp.form = formFieldService.toFormGroup( [textareaField] );
    comp.field = textareaField;
    comp.value = {ctrl2: 'This is a textarea'};
    comp.parentKey = null;

    fixture.detectChanges(); // trigger change detection
    expect( (<HTMLTextAreaElement>element.querySelector( 'textarea' )).rows ).toBe( 10 );
  } ) );

  it( 'should create a select box', initComp( (comp, element, fixture) => {
    let selectField: FieldBase<any> = new DropdownField( {
      key: 'ctrlSelect',
      label: 'Titel of ctrlSelect',
      options: [
        {key: 'a', value: 'Key A'},
        {key: 'b', value: 'Key B'},
        {key: 'c', value: 'Key C'},
        {key: 'd', value: 'Key D'}
      ]
    } );

    comp.form = formFieldService.toFormGroup( [selectField] );
    comp.field = selectField;
    comp.value = {ctrlSelect: 'c'};

    fixture.detectChanges(); // trigger change detection
    expect( (<HTMLElement>element.querySelector( 'label' )).innerText ).toBe( 'Titel of ctrlSelect' );
    expect( (<HTMLSelectElement>element.querySelector( 'select' )).value ).toBe( 'c' );
    expect( (<HTMLSelectElement>element.querySelector( 'select' )).selectedOptions.item( 0 ).textContent ).toBe( 'Key C' );
  } ) );

  xit( 'should create a combo box', () => {

  } );

  it( 'should create a checkbox', initComp( (comp, element, fixture) => {
    let checkboxField: FieldBase<any> = new CheckboxField( {
      key: 'ctrlCheckbox',
      label: 'Titel of ctrlCheckbox',
      type: 'checkbox'
    } );

    comp.form = formFieldService.toFormGroup( [checkboxField] );
    comp.field = checkboxField;
    comp.value = {ctrlCheckbox: true};

    fixture.detectChanges(); // trigger change detection
    expect( (<HTMLElement>element.querySelector( 'label' )).innerText ).toBe( 'Titel of ctrlCheckbox' );
    expect( (<HTMLInputElement>element.querySelector( 'input' )).value ).toBe( 'on' );
    expect( (<HTMLInputElement>element.querySelector( 'input' )).checked ).toBe( true );
  } ) );

  xit( 'should create a radio button group (BUG: formControlName cannot be the same for all radio buttons)', initComp( (comp, element, fixture) => {
    let radioField: FieldBase<any> = new RadioField( {
      key: 'ctrlRadio',
      label: 'Gender',
      options: [
        {label: 'male', value: 'm'},
        {label: 'female', value: 'f'}
      ]
    } );

    comp.form = formFieldService.toFormGroup( [radioField] );
    comp.field = radioField;
    comp.value = {ctrlRadio: 'f'};

    fixture.detectChanges(); // trigger change detection
    expect( (<HTMLElement>element.querySelector( 'label' )).innerText ).toBe( 'Gender' );
    expect( (<HTMLInputElement>element.querySelector( 'input' )).value ).toBe( 'f' );
    expect( (<HTMLInputElement>element.querySelector( 'input' )).checked ).toBe( true );
  } ) );

  /*it('should be async TEST', async( inject(
    [TestComponentBuilder], (tcb: TestComponentBuilder) => {
      return tcb.overrideProviders( DynamicFieldComponent, [] )
        .createAsync( DynamicFieldComponent )
        .then( (fixture) => {
          done();
        });
    })));*/
  // });

  it( 'should create a table', initComp( (comp, element, fixture) => {
    let selectField: FieldBase<any> = new TableField( {
      key: 'ctrlTable',
      label: 'Titel of ctrlTable',
      columns: [
        {field: 'col1', headerName: 'Column 1'},
        {field: 'col2', headerName: 'Column 2'}
      ]
    } );

    comp.form = formFieldService.toFormGroup( [selectField] );
    comp.field = selectField;
    comp.value = {
      ctrlTable: [
        {col1: 'Text1', col2: 'Text2'},
        {col1: 'Text3', col2: 'Text4'}
      ]
    };
    fixture.detectChanges(); // trigger change detection
    expect( (<HTMLElement>element.querySelector( 'label' )).innerText ).toBe( 'Titel of ctrlTable' );
  } ) );

  it( 'should create a date field', initComp( (comp, element, fixture) => {
    let textfield: FieldBase<any> = new TextboxField( {
      key: 'ctrlDate',
      label: 'Titel of ctrlDate',
      type: 'date'
    } );

    comp.form = formFieldService.toFormGroup( [textfield] );
    comp.field = textfield;
    comp.value = {ctrlDate: '10.10.1978'};

    fixture.detectChanges(); // trigger change detection
    expect( (<HTMLElement>element.querySelector( 'label' )).innerText ).toBe( 'Titel of ctrlDate' );
    expect( (<HTMLInputElement>element.querySelector( 'input' )).value ).toBe( '10.10.1978' );
  } ) );

  xit( 'should create a nested field', () => {

  } );

  // PRIVATE FUNCTIONS
  function initComp(callback: CallbackFunction) {
    return fakeAsync( inject(
      [TestComponentBuilder], (tcb: TestComponentBuilder) => {
        return tcb.overrideProviders( DynamicFieldComponent, [] )
          .createAsync( DynamicFieldComponent )
          .then( (fixture) => {
            let comp = fixture.componentInstance,
              element = fixture.nativeElement;
            callback( comp, element, fixture );
          } );
      } ) );
  }
} );