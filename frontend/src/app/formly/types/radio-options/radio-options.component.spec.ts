import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UiMultiToggleComponent } from "./radio-options.component";

describe("UiMultiToggleComponent", () => {
  let component: UiMultiToggleComponent;
  let fixture: ComponentFixture<UiMultiToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiMultiToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiMultiToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
