import { TestBed } from '@angular/core/testing';

import { Addons } from './addons';

describe('Addons', () => {
  let service: Addons;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Addons);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
