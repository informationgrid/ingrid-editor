import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseAddressDialogComponent } from './choose-address-dialog.component';

describe('ChooseAddressDialogComponent', () => {
  let component: ChooseAddressDialogComponent;
  let fixture: ComponentFixture<ChooseAddressDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseAddressDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseAddressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
