import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormDashboardComponent } from './form-dashboard.component';

describe('FormDashboardComponent', () => {
  let component: FormDashboardComponent;
  let fixture: ComponentFixture<FormDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
