import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgeCheckboxComponent } from './checkbox.component';

describe('IgeCheckboxComponent', () => {
  let component: IgeCheckboxComponent;
  let fixture: ComponentFixture<IgeCheckboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IgeCheckboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IgeCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
