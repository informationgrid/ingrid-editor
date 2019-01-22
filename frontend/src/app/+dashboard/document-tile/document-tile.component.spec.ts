import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTileComponent } from './document-tile.component';

describe('DocumentTileComponent', () => {
  let component: DocumentTileComponent;
  let fixture: ComponentFixture<DocumentTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
