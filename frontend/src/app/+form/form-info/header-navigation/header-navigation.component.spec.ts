import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { HeaderNavigationComponent } from "./header-navigation.component";

describe("HeaderNavigationComponent", () => {
  let component: HeaderNavigationComponent;
  let fixture: ComponentFixture<HeaderNavigationComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HeaderNavigationComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
