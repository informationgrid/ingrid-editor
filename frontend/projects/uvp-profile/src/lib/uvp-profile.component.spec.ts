import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UvpProfileComponent } from './uvp-profile.component';

describe('UvpProfileComponent', () => {
  let component: UvpProfileComponent;
  let fixture: ComponentFixture<UvpProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UvpProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UvpProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
