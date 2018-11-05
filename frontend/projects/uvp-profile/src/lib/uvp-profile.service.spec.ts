import { TestBed } from '@angular/core/testing';

import { UvpProfileService } from './uvp-profile.service';

describe('UvpProfileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UvpProfileService = TestBed.get(UvpProfileService);
    expect(service).toBeTruthy();
  });
});
