import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenDataWizardComponent } from './open-data-wizard.component';

describe('OpenDataWizardComponent', () => {
  let component: OpenDataWizardComponent;
  let fixture: ComponentFixture<OpenDataWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenDataWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenDataWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
