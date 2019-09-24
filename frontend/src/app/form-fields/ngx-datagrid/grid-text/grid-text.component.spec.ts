import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridTextComponent } from './grid-text.component';

describe('GridTextComponent', () => {
  let component: GridTextComponent;
  let fixture: ComponentFixture<GridTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
