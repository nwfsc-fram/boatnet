import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TallyPdfComponent } from './tally-pdf.component';

describe('TallyPdfComponent', () => {
  let component: TallyPdfComponent;
  let fixture: ComponentFixture<TallyPdfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TallyPdfComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TallyPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
