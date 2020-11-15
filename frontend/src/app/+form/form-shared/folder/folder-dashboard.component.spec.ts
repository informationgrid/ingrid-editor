import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FolderDashboardComponent } from './folder-dashboard.component';

describe('FormDashboardComponent', () => {
  let component: FolderDashboardComponent;
  let fixture: ComponentFixture<FolderDashboardComponent>;

  beforeEach(waitForAsync(() => {
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
