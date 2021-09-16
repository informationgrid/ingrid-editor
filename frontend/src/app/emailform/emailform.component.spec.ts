import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmailformComponent } from "./emailform.component";

describe("EmailformComponent", () => {
  let component: EmailformComponent;
  let fixture: ComponentFixture<EmailformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmailformComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit("should create", () => {
    expect(component).toBeTruthy();
  });
});
