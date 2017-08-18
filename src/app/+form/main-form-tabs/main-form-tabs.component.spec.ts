import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainFormTabsComponent } from './main-form-tabs.component';

describe('MainFormTabsComponent', () => {
  let component: MainFormTabsComponent;
  let fixture: ComponentFixture<MainFormTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainFormTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainFormTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
