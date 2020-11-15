import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EmptyNavigationComponent } from './empty-navigation.component';

describe('EmptyNavigationComponent', () => {
  let component: EmptyNavigationComponent;
  let fixture: ComponentFixture<EmptyNavigationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EmptyNavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptyNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
