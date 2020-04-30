import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderTitleRowMinComponent } from './header-title-row-min.component';

describe('HeaderTitleRowMinComponent', () => {
  let component: HeaderTitleRowMinComponent;
  let fixture: ComponentFixture<HeaderTitleRowMinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderTitleRowMinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderTitleRowMinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
