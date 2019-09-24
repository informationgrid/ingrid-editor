import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridSelectComponent } from './grid-select.component';

describe('GridSelectComponent', () => {
  let component: GridSelectComponent;
  let fixture: ComponentFixture<GridSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
