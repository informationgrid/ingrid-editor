import {TestBed} from "@angular/core/testing";
import {DynamicFormComponent} from "./dynamic-form.component";
import {FormularService} from "../services/formular/formular.service";
import {FormGroup, FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FormToolbarComponent} from "./toolbar/form-toolbar.component";
import {BrowserComponent} from "./sidebars/browser/browser.component";
import {DynamicFieldComponent} from "./dynamic-field.component";
import {ModalModule} from "ng2-modal";
import {CustomInput} from "./table/table.component";
import {LeafletComponent} from "./leaflet/leaflet.component";
import {AgGridModule} from "ag-grid-ng2";
import {FormControlService} from "../services/form-control.service";
import {BehaviourService} from "../services/behaviour/behaviour.service";
import {BehavioursDefault} from "../services/behaviour/behaviours";
import {StorageService} from "../services/storage/storage.service";
import {HttpModule} from "@angular/http";
import {FormToolbarService} from "./toolbar/form-toolbar.service";
import {ROUTER_PROVIDERS} from "@angular/router/src/router_module";
import {IgeModule} from "../app.module";
import {IgeFormModule} from "./ige-form.module";
import {HashLocationStrategy, LocationStrategy} from "@angular/common";
import {StorageDummyService} from "../services/storage/storage.dummy.service";
import {appRoutingProviders, routing} from "../router";
import {RadioControlRegistry} from "@angular/forms/src/directives/radio_control_value_accessor";
import {TranslateModule} from "ng2-translate";
import {PluginsModule} from "../plugins/plugins.module";
import {FieldsModule} from "../+fields/fields.module";
import {DashboardModule} from "../+dashboard/dashboard.module";
import {BrowserModule} from "@angular/platform-browser";
import {MenuComponent} from "../menu/menu.component";
import {StatisticComponent} from "../plugins/statistic/statistic.component";
import {AppComponent} from "../app.component";
import {ActivatedRoute, ROUTER_PROVIDERS} from "@angular/router";

let fixture: any, comp: DynamicFormComponent, el: any, fService: FormularService;

describe('Dynamic Form', () => {
  beforeEach(() => {

    // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      // declarations: [DynamicFormComponent, FormToolbarComponent, BrowserComponent, DynamicFieldComponent, CustomInput, LeafletComponent ],
      // providers: [FormControlService, BehaviourService, BehavioursDefault, FormularService, FormToolbarService, StorageService],
      // imports: [ReactiveFormsModule, FormsModule, ModalModule, AgGridModule]
      imports: [IgeFormModule, HttpModule, ROUTER_PROVIDERS],
      providers: [BehaviourService, BehavioursDefault, FormularService, StorageService, FormToolbarService]

      // declarations: [DynamicFormComponent, FormToolbarComponent, BrowserComponent, DynamicFieldComponent, CustomInput, LeafletComponent ],
      // providers: [ROUTER_PROVIDERS, DynamicFormComponent, FormToolbarComponent, FormToolbarService, FormControlService, BehaviourService, BehavioursDefault, FormularService, StorageService],
      // declarations: [AppComponent, StatisticComponent, MenuComponent], // directives, components, and pipes owned by this NgModule
      // imports: [BrowserModule, HttpModule, IgeFormModule, DashboardModule, FieldsModule, PluginsModule, routing, TranslateModule.forRoot()],
      // providers: [ROUTER_PROVIDERS, RadioControlRegistry, appRoutingProviders, FormToolbarService, FormularService, StorageService, StorageDummyService, BehaviourService, BehavioursDefault, {
      //   provide: LocationStrategy,
      //   useClass: HashLocationStrategy
      // }]
      // imports: [IgeFormModule, IgeModule] //, HttpModule, ReactiveFormsModule, FormsModule, ModalModule, AgGridModule.forRoot()]
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