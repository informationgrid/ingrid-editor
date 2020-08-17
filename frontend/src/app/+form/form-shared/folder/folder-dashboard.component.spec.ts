import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderDashboardComponent } from './form-dashboard.component';

describe('FormDashboardComponent', () => {
  let component: FolderDashboardComponent;
  let fixture: ComponentFixture<FolderDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
