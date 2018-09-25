import { TestBed, inject } from '@angular/core/testing';

import { TallyService } from './tally.service';

describe('TallyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TallyService]
    });
  });

  it('should be created', inject([TallyService], (service: TallyService) => {
    expect(service).toBeTruthy();
  }));
});
