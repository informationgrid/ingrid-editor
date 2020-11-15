import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OpenDataWizardComponent } from './open-data-wizard.component';

describe('OpenDataWizardComponent', () => {
  let component: OpenDataWizardComponent;
  let fixture: ComponentFixture<OpenDataWizardComponent>;

  beforeEach(waitForAsync(() => {
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
