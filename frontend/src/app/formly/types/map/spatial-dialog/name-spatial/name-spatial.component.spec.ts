import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NameSpatialComponent } from './name-spatial.component';

describe('NameSpatialComponent', () => {
  let component: NameSpatialComponent;
  let fixture: ComponentFixture<NameSpatialComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NameSpatialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NameSpatialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
