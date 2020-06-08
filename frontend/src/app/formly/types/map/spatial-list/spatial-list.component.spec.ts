import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpatialListComponent } from './spatial-list.component';

describe('SpatialItemComponent', () => {
  let component: SpatialListComponent;
  let fixture: ComponentFixture<SpatialListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpatialListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpatialListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
