import { TestBed } from '@angular/core/testing';

import { DocumentDataService } from './document-data.service';

describe('DocumentDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DocumentDataService = TestBed.get(DocumentDataService);
    expect(service).toBeTruthy();
  });
});
