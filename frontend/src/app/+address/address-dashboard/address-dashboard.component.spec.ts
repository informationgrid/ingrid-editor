import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddressDashboardComponent } from './address-dashboard.component';

describe('AddressDashboardComponent', () => {
  let component: AddressDashboardComponent;
  let fixture: ComponentFixture<AddressDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
