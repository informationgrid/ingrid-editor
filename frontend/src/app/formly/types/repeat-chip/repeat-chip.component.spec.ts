import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepeatChipComponent } from './repeat-chip.component';

describe('RepeatChipComponent', () => {
  let component: RepeatChipComponent;
  let fixture: ComponentFixture<RepeatChipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepeatChipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepeatChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
