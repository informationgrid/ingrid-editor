import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupHeaderMoreComponent } from './header-more.component';

describe('HeaderMoreComponent', () => {
  let component: GroupHeaderMoreComponent;
  let fixture: ComponentFixture<GroupHeaderMoreComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupHeaderMoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupHeaderMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
