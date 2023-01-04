import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DialogTemplateComponent } from "./dialog-template.component";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";

describe("DialogTemplateComponent", () => {
  let component: DialogTemplateComponent;
  let fixture: ComponentFixture<DialogTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogTemplateComponent],
      imports: [MatDialogModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
