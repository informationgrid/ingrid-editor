import {TestBed} from '@angular/core/testing';
import {DynamicFormComponent} from './dynamic-form.component';
import {FormControl, FormGroup} from '@angular/forms';
import {DocumentService} from '../../../services/document/document.service';
import {FormToolbarService} from '../toolbar/form-toolbar.service';
import {IgeFormModule} from '../../ige-form.module';
import {HttpClientModule} from '@angular/common/http';
import {FormularService} from '../../formular.service';

let fixture: any, comp: DynamicFormComponent, el: any, fService: FormularService;

describe('Dynamic Form', () => {
  beforeEach(() => {

    // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      imports: [IgeFormModule, HttpClientModule],
      providers: [FormularService, DocumentService, FormToolbarService]
    });

    // create component and test fixture
    fixture = TestBed.createComponent(DynamicFormComponent);

    // get test component from the fixture
    comp = fixture.componentInstance;

    // UserService actually injected into the component
    fService = fixture.debugElement.injector.get(FormularService);
  });

  it('should return the form value on demand', () => {

    const fc = new FormControl('23');
    comp.form = new FormGroup({test: fc});

    // expect(fService.requestFormValues()).toBe(1);
    // trigger data binding to update the view
    // fixture.detectChanges();

  });

});
