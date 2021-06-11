import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ContextHelpComponent } from "./context-help.component";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

describe("ContextHelpComponent", () => {
  let component: ContextHelpComponent;
  let fixture: ComponentFixture<ContextHelpComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ContextHelpComponent],
        providers: [
          // workaround: why I can't inject MatDialogRef in the unit test? https://github.com/angular/components/issues/8419
          { provide: MatDialogRef, useValue: {} },
          { provide: MAT_DIALOG_DATA, useValue: [] },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
