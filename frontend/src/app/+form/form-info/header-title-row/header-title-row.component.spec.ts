import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderTitleRowComponent } from './header-title-row.component';

describe('HeaderTitleRowComponent', () => {
  let component: HeaderTitleRowComponent;
  let fixture: ComponentFixture<HeaderTitleRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderTitleRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderTitleRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
