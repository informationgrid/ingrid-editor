import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeSpatialComponent } from './free-spatial.component';

describe('FreeSpatialComponent', () => {
  let component: FreeSpatialComponent;
  let fixture: ComponentFixture<FreeSpatialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreeSpatialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreeSpatialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
