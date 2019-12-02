import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeHeaderComponent } from './tree-header.component';

describe('TreeHeaderComponent', () => {
  let component: TreeHeaderComponent;
  let fixture: ComponentFixture<TreeHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
