import { TestBed } from '@angular/core/testing';

import { CoinzeeService } from './coinzee.service';

describe('CoinzeeService', () => {
  let service: CoinzeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoinzeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
