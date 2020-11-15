import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DateboxComponent } from './datebox.component';

describe('DateboxComponent', () => {
  let component: DateboxComponent;
  let fixture: ComponentFixture<DateboxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DateboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
