import { TestBed, inject } from '@angular/core/testing';

import { PdfGenerationService } from './pdf-generation.service';

describe('PdfGenerationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PdfGenerationService]
    });
  });

  it('should be created', inject([PdfGenerationService], (service: PdfGenerationService) => {
    expect(service).toBeTruthy();
  }));
});
