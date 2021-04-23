import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreePermissionComponent } from './tree-permission.component';

describe('TreePermissionComponent', () => {
  let component: TreePermissionComponent;
  let fixture: ComponentFixture<TreePermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreePermissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreePermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
