import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RadioboxComponent } from './radiobox.component';

describe('RadioboxComponent', () => {
  let component: RadioboxComponent;
  let fixture: ComponentFixture<RadioboxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RadioboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
