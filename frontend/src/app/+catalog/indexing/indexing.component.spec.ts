import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IndexingComponent } from './indexing.component';

describe('IndexingComponent', () => {
  let component: IndexingComponent;
  let fixture: ComponentFixture<IndexingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IndexingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndexingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
