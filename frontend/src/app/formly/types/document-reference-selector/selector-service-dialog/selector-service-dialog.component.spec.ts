import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SelectorServiceDialogComponent } from "./selector-service-dialog.component";

describe("SelectorServiceDialogComponent", () => {
  let component: SelectorServiceDialogComponent;
  let fixture: ComponentFixture<SelectorServiceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorServiceDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorServiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
