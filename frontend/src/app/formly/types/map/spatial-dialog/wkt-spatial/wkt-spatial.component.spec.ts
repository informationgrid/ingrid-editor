import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WktSpatialComponent } from './wkt-spatial.component';

describe('WktSpatialComponent', () => {
  let component: WktSpatialComponent;
  let fixture: ComponentFixture<WktSpatialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WktSpatialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WktSpatialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
