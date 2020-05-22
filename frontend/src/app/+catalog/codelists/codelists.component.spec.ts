import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodelistsComponent } from './codelists.component';

describe('CodelistsComponent', () => {
  let component: CodelistsComponent;
  let fixture: ComponentFixture<CodelistsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodelistsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodelistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
