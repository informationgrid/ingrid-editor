import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridBaseComponent } from './grid-base.component';

describe('GridBaseComponent', () => {
  let component: GridBaseComponent;
  let fixture: ComponentFixture<GridBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
