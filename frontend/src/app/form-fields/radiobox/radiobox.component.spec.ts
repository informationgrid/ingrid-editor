import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { RadioboxComponent } from "./radiobox.component";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { FormsModule } from "@angular/forms";

describe("RadioboxComponent", () => {
  let component: RadioboxComponent;
  let fixture: ComponentFixture<RadioboxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RadioboxComponent],
      imports: [MatRadioModule, FormsModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
