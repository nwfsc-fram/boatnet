import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesCompositionComponent } from './species-composition.component';

describe('SpeciesCompositionComponent', () => {
  let component: SpeciesCompositionComponent;
  let fixture: ComponentFixture<SpeciesCompositionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SpeciesCompositionComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesCompositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
