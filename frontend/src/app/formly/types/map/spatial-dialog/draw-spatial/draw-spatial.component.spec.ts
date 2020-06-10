import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawSpatialComponent } from './draw-spatial.component';

describe('DrawSpatialComponent', () => {
  let component: DrawSpatialComponent;
  let fixture: ComponentFixture<DrawSpatialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawSpatialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawSpatialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
