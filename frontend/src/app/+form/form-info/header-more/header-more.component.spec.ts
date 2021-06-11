import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { HeaderMoreComponent } from "./header-more.component";

describe("HeaderMoreComponent", () => {
  let component: HeaderMoreComponent;
  let fixture: ComponentFixture<HeaderMoreComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HeaderMoreComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
