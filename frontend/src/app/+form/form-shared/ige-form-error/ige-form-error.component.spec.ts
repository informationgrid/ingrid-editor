import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgeFormErrorComponent } from './form-error.component';

describe('IgeFormErrorComponent', () => {
  let component: IgeFormErrorComponent;
  let fixture: ComponentFixture<IgeFormErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IgeFormErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IgeFormErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
