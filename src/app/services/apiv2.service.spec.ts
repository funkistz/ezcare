import { TestBed } from '@angular/core/testing';

import { Apiv2Service } from './apiv2.service';

describe('Apiv2Service', () => {
  let service: Apiv2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Apiv2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
