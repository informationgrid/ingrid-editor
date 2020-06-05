import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpatialDialogComponent } from './spatial-dialog.component';

describe('SpatialDialogComponent', () => {
  let component: SpatialDialogComponent;
  let fixture: ComponentFixture<SpatialDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpatialDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpatialDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
