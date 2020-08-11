import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexingComponent } from './indexing.component';

describe('IndexingComponent', () => {
  let component: IndexingComponent;
  let fixture: ComponentFixture<IndexingComponent>;

  beforeEach(async(() => {
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
