import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridDateComponent } from './grid-date.component';

describe('GridDateComponent', () => {
  let component: GridDateComponent;
  let fixture: ComponentFixture<GridDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
