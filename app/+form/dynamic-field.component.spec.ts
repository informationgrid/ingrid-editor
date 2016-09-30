import {ReactiveFormsModule} from "@angular/forms";
import {DynamicFieldComponent} from "./dynamic-field.component";
import {TestBed} from "@angular/core/testing";
import {TextboxField, FieldBase, TextareaField, DropdownField, CheckboxField, TableField, RadioField} from "./controls";
import {By} from "@angular/platform-browser";
import {FormControlService} from "../services/form-control.service";
import {AgGridModule} from "ag-grid-ng2";
import {CustomInput} from "./table/table.component";
import {LeafletComponent} from "./leaflet/leaflet.component";


describe('Formular fields', () => {

  let fixture: any, comp: any, el: any;
  let formFieldService = new FormControlService();
  // jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DynamicFieldComponent, CustomInput, LeafletComponent],
      imports: [ReactiveFormsModule, AgGridModule.forRoot()],
      // providers: [FormularService]
    });

    // create component and test fixture
    fixture = TestBed.createComponent(DynamicFieldComponent);

    // get test component from the fixture
    comp = fixture.componentInstance;

  });

  // specs
  it('should create a text field', () => {
    let textfield: FieldBase<any> = new TextboxField({
     key: 'ctrl1',
     label: 'Titel of ctrl1'
     });

    let element = fixture.debugElement;

     comp.form = formFieldService.toFormGroup([textfield]);
     comp.field = textfield;
     comp.value = {ctrl1: 'This is a textbox'};

     // fixture.autoDetectChanges( true );
     fixture.detectChanges(); // trigger change detection

     expect(element.query(By.css('label')).nativeElement.innerText).toBe('Titel of ctrl1');
     expect(element.query(By.css('input')).nativeElement.value).toBe('This is a textbox');
  });

  it('should create a text area', () => {
    // let fixture = TestBed.createComponent(DynamicFieldComponent);
    fixture.whenStable().then(() => {
      let textareaField: FieldBase<any> = new TextareaField({
        key: 'ctrl2',
        label: 'Titel of ctrl2'
      });

      let comp = fixture.componentInstance;
      let element = fixture.debugElement;

      comp.form = formFieldService.toFormGroup([textareaField]);
      comp.field = textareaField;
      comp.value = {ctrl2: 'This is a textarea'};

      fixture.detectChanges(); // trigger change detection
      expect(element.query(By.css('label')).nativeElement.innerText).toBe('Titel of ctrl2');

      let textarea = element.query(By.css('textarea')).nativeElement;
      expect(textarea.rows).toBe(3);
      expect(textarea.value).toBe('This is a textarea');
    });
  });

  it('should create a text area with a defined number of rows', () => {
    // let fixture = TestBed.createComponent(DynamicFieldComponent);
    fixture.whenStable().then(() => {
      let textareaField: FieldBase<any> = new TextareaField({
        key: 'ctrl2',
        label: 'Titel of ctrl2',
        rows: 10
      });

      let comp = fixture.componentInstance;
      let element = fixture.debugElement;

      comp.form = formFieldService.toFormGroup([textareaField]);
      comp.field = textareaField;
      comp.value = {ctrl2: 'This is a textarea'};

      fixture.detectChanges(); // trigger change detection
      expect(element.query(By.css('textarea')).nativeElement.rows).toBe(10);
    });
  });

  it('should create a select box', () => {
    // let fixture = TestBed.createComponent(DynamicFieldComponent);
    fixture.whenStable().then(() => {
      let selectField: FieldBase<any> = new DropdownField({
        key: 'ctrlSelect',
        label: 'Titel of ctrlSelect',
        options: [
          {key: 'a', value: 'Key A'},
          {key: 'b', value: 'Key B'},
          {key: 'c', value: 'Key C'},
          {key: 'd', value: 'Key D'}
        ]
      });

      let comp = fixture.componentInstance;
      let element = fixture.debugElement;

      comp.form = formFieldService.toFormGroup([selectField]);
      comp.field = selectField;
      comp.value = {ctrlSelect: 'c'};

      fixture.detectChanges(); // trigger change detection
      expect(element.query(By.css('label')).nativeElement.innerText).toBe('Titel of ctrlSelect');
      let select = element.query(By.css('select')).nativeElement;
      expect(select.value).toBe('c');
      expect(select.selectedOptions.item(0).textContent).toBe('Key C');
    });
  });

  xit('should create a combo box', () => {
    // let fixture = TestBed.createComponent(DynamicFieldComponent);
    fixture.whenStable().then(() => {

    });
  });

  it('should create a checkbox', () => {
    // let fixture = TestBed.createComponent(DynamicFieldComponent);
    fixture.whenStable().then(() => {
      let checkboxField: FieldBase<any> = new CheckboxField({
        key: 'ctrlCheckbox',
        label: 'Titel of ctrlCheckbox',
        type: 'checkbox'
      });

      let comp = fixture.componentInstance;
      let element = fixture.debugElement;

      comp.form = formFieldService.toFormGroup([checkboxField]);
      comp.field = checkboxField;
      comp.value = {ctrlCheckbox: true};

      fixture.detectChanges(); // trigger change detection
      expect(element.query(By.css('label')).nativeElement.innerText.trim()).toBe('Titel of ctrlCheckbox');
      let checkbox = element.query(By.css('input')).nativeElement;
      expect(checkbox.value).toBe('on');
      expect(checkbox.checked).toBe(true);
    });
  });

  it('should create a radio button group with initial state', () => {
    let fixture = TestBed.createComponent(DynamicFieldComponent);
    fixture.whenStable().then(() => {
      let radioField: FieldBase<any> = new RadioField({
        key: 'ctrlRadio',
        label: 'Gender',
        options: [
          {label: 'male', value: 'm'},
          {label: 'female', value: 'f'}
        ]
      });

      let comp = fixture.componentInstance;
      let element = fixture.debugElement;

      comp.form = formFieldService.toFormGroup([radioField]);
      comp.field = radioField;
      comp.value = {ctrlRadio: 'f'};

      fixture.detectChanges(); // trigger change detection
      expect(element.query(By.css('label')).nativeElement.innerText).toBe('Gender');
      let radios = element.queryAll(By.css('input'));
      let radioMale = radios[0].nativeElement;
      let radioFemale = radios[1].nativeElement;
      expect(comp.form.value.ctrlRadio).toBe('f');
      expect(radioMale.checked).toBe(false);
      expect(radioFemale.checked).toBe(true);

      // set other radio button and check form
      radioMale.checked = true;

      fixture.detectChanges(); // trigger change detection
      expect(radioMale.checked).toBe(true);
      expect(radioFemale.checked).toBe(false);
      expect(comp.form.value.ctrlRadio).toBe('m');
    });
  });

  /*ixt('should be async TEST', async( inject(
   [TestComponentBuilder], (tcb: TestComponentBuilder) => {
   return tcb.overrideProviders( DynamicFieldComponent, [] )
   .createAsync( DynamicFieldComponent )
   .then( (fixture) => {
   done();
   });
   })));*/
  // });

  it('should create a table', () => {
    let fixture = TestBed.createComponent(DynamicFieldComponent);
    fixture.whenStable().then(() => {
      let selectField: FieldBase<any> = new TableField({
        key: 'ctrlTable',
        label: 'Titel of ctrlTable',
        columns: [
          {field: 'col1', headerName: 'Column 1'},
          {field: 'col2', headerName: 'Column 2'}
        ]
      });

      let comp = fixture.componentInstance;
      let element = fixture.debugElement;

      comp.form = formFieldService.toFormGroup([selectField]);
      comp.field = selectField;
      comp.value = {
        ctrlTable: [
          {col1: 'Text1', col2: 'Text2'},
          {col1: 'Text3', col2: 'Text4'}
        ]
      };
      fixture.detectChanges(); // trigger change detection
      expect(element.query(By.css('label')).nativeElement.innerText).toBe('Titel of ctrlTable');
      // expect(1).toBe(2);
      /*let rows = element.query( By.css( '.ag-body-viewport .ag-row' ) );
       console.log( 'rows', rows );
       expect( rows ).not.toBeUndefined();
       expect( rows.length ).toBe( 2 );
       expect( rows[0].query( By.css( 'div' )[0] ).nativeElement.innerText ).toBe( 'Text1' );
       expect( rows[0].query( By.css( 'div' )[1] ).nativeElement.innerText ).toBe( 'Text2' );
       expect( rows[1].query( By.css( 'div' )[0] ).nativeElement.innerText ).toBe( 'Text3' );
       expect( rows[1].query( By.css( 'div' )[1] ).nativeElement.innerText ).toBe( 'Text4' );*/

      let headerCells = element.queryAll(By.css('.ag-header-cell'));
      console.log('header', headerCells);
      expect(headerCells[0].nativeElement.innerText.trim()).toBe('Column 1');
      expect(headerCells[1].nativeElement.innerText.trim()).toBe('Column 2X');
    }, (error) => fail('test failes'));
  });

  it('should create a date field', () => {
    let fixture = TestBed.createComponent(DynamicFieldComponent);
    fixture.whenStable().then(() => {
      let textfield: FieldBase<any> = new TextboxField({
        key: 'ctrlDate',
        label: 'Titel of ctrlDate',
        type: 'date'
      });

      let comp = fixture.componentInstance;
      let element = fixture.debugElement;

      comp.form = formFieldService.toFormGroup([textfield]);
      comp.field = textfield;
      comp.value = {ctrlDate: '10.10.1978'};

      fixture.detectChanges(); // trigger change detection
      expect(element.query(By.css('label')).nativeElement.innerText).toBe('Titel of ctrlDate');
      expect(element.query(By.css('input')).nativeElement.value).toBe('10.10.1978');
    });
  });

  xit('should create a nested field', () => {

  });

});