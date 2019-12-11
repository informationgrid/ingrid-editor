import { TestBed } from '@angular/core/testing';

import { FormMessageService } from './form-message.service';

describe('FormMessageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormMessageService = TestBed.get(FormMessageService);
    expect(service).toBeTruthy();
  });
});
