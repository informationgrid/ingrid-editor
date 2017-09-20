import {By} from "@angular/platform-browser";
import {FormToolbarComponent} from "./form-toolbar.component";
import {TestBed} from "@angular/core/testing";
import {FormToolbarService, ToolbarItem} from "./form-toolbar.service";

let fixture: any, comp: any, el: any, ftService: FormToolbarService;

describe('Form-Toolbar', () => {
  beforeEach(() => {

    // refine the test module by declaring the test component
    TestBed.configureTestingModule({
      declarations: [FormToolbarComponent],
      providers: [FormToolbarService]
    });

    // create component and test fixture
    fixture = TestBed.createComponent(FormToolbarComponent);

    // get test component from the fixture
    comp = fixture.componentInstance;

    // UserService actually injected into the component
    ftService = fixture.debugElement.injector.get(FormToolbarService);
  });

  it('should show some toolbar items', () => {

    // trigger data binding to update the view
    fixture.detectChanges();

    // find the title element in the DOM using a CSS selector
    el = fixture.debugElement.queryAll(By.css('button'));

    // confirm the element's content
    expect(el.length).toBe(4);
    expect(el[0].parent.queryAll(By.css('.glyphicon-file')).length).toBe(1);
  });

  it('should add a toolbar item through the service', () => {
    let item: ToolbarItem = {id: 'btnToolbarTest', tooltip: 'TEST_TOOLBAR_ITEM', cssClasses: 'TEST_CSS_CLASS', eventId: 'TEST_EVENT'};
    ftService.addButton(item);

    fixture.detectChanges();

    // find the title element in the DOM using a CSS selector
    el = fixture.debugElement.queryAll(By.css('button'));

    // confirm the element's content
    expect(el.length).toBe(5);
  });
});
