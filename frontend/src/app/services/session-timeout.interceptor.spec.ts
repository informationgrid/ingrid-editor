import { TestBed } from '@angular/core/testing';

import { SessionTimeoutInterceptor } from './session-timeout.interceptor';

describe('TimeoutInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      SessionTimeoutInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: SessionTimeoutInterceptor = TestBed.inject(SessionTimeoutInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
