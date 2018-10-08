import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDocumentComponent } from './new-document.component';

describe('NewDocumentComponent', () => {
  let component: NewDocumentComponent;
  let fixture: ComponentFixture<NewDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
