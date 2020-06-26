import { TestBed } from '@angular/core/testing';

import { DocumentDataService } from './document-data.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('DocumentDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule
    ]
  }));

  it('should be created', () => {
    const service: DocumentDataService = TestBed.get(DocumentDataService);
    expect(service).toBeTruthy();
  });
});
