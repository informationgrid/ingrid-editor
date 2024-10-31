import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentReferenceSelectorComponent } from './document-reference-selector.component';

describe('DocumentReferenceSelectorComponent', () => {
  let component: DocumentReferenceSelectorComponent;
  let fixture: ComponentFixture<DocumentReferenceSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentReferenceSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentReferenceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
