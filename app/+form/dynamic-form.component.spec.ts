import {TestBed} from "@angular/core/testing";
import {DynamicFormComponent} from "./dynamic-form.component";
import {FormularService} from "../services/formular/formular.service";
import {FormGroup, FormControl} from "@angular/forms";
import {BehaviourService} from "../services/behaviour/behaviour.service";
import {BehavioursDefault} from "../services/behaviour/behaviours";
import {StorageService} from "../services/storage/storage.service";
import {HttpModule} from "@angular/http";
import {FormToolbarService} from "./toolbar/form-toolbar.service";
import {ROUTER_PROVIDERS} from "@angular/router/src/router_module";
import {IgeFormModule} from "./ige-form.module";
import {ROUTER_PROVIDERS} from "@angular/router";

let fixture: any, comp: DynamicFormComponent, el: any, fService: FormularService;

describe('Dynamic Form', () => {
  beforeEach(() => {

    // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      imports: [IgeFormModule, HttpModule, ROUTER_PROVIDERS],
      providers: [BehaviourService, BehavioursDefault, FormularService, StorageService, FormToolbarService]
    });

    // create component and test fixture
    fixture = TestBed.createComponent(DynamicFormComponent);

    // get test component from the fixture
    comp = fixture.componentInstance;

    // UserService actually injected into the component
    fService = fixture.debugElement.injector.get(FormularService);
  });

  it('should return the form value on demand', () => {

    let fc = new FormControl('23');
    comp.form = new FormGroup({test: fc});

    expect(fService.requestFormValues()).toBe(1);
    // trigger data binding to update the view
    // fixture.detectChanges();

  });

});