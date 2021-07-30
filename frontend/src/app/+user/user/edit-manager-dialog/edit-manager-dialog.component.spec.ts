import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EditManagerDialogComponent } from "./edit-manager-dialog.component";

describe("EditManagerDialogComponent", () => {
  let component: EditManagerDialogComponent;
  let fixture: ComponentFixture<EditManagerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditManagerDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditManagerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit("should create", () => {
    expect(component).toBeTruthy();
  });
});
