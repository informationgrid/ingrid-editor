import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineHelpWrapperComponent } from './inline-help-wrapper.component';

describe('InlineHelpWrapperComponent', () => {
  let component: InlineHelpWrapperComponent;
  let fixture: ComponentFixture<InlineHelpWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineHelpWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineHelpWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
