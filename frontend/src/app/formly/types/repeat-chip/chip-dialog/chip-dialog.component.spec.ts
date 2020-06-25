import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipDialogComponent } from './chip-dialog.component';

describe('ChipDialogComponent', () => {
  let component: ChipDialogComponent;
  let fixture: ComponentFixture<ChipDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChipDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChipDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
