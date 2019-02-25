import { async, TestBed } from '@angular/core/testing';
import { BnSecurityModule } from './bn-security.module';

describe('BnSecurityModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BnSecurityModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(BnSecurityModule).toBeDefined();
  });
});
