import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { CardBoxComponent } from "./card-box.component";
import { MatCardModule } from "@angular/material/card";

describe("CardBoxComponent", () => {
  let component: CardBoxComponent;
  let fixture: ComponentFixture<CardBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CardBoxComponent],
      imports: [MatCardModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
