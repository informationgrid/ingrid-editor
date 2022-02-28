import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { CheckboxComponent } from "./checkbox.component";
import { MatCheckboxModule } from "@angular/material/checkbox";

describe("IgeCheckboxComponent", () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CheckboxComponent],
        imports: [MatCheckboxModule],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
