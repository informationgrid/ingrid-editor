import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PublishPendingComponent } from "./publish-pending.component";

describe("PublishPendingComponent", () => {
  let component: PublishPendingComponent;
  let fixture: ComponentFixture<PublishPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublishPendingComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit("should create", () => {
    expect(component).toBeTruthy();
  });
});
