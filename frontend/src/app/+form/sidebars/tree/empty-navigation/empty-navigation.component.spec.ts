import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyNavigationComponent } from './empty-navigation.component';

describe('EmptyNavigationComponent', () => {
  let component: EmptyNavigationComponent;
  let fixture: ComponentFixture<EmptyNavigationComponent>;

  beforeEach(async(() => {
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
