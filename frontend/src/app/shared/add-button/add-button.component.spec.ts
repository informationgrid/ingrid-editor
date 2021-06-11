import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { AddButtonComponent } from "./add-button.component";

describe("AddButtonComponent", () => {
  let component: AddButtonComponent;
  let fixture: ComponentFixture<AddButtonComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AddButtonComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AddButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
