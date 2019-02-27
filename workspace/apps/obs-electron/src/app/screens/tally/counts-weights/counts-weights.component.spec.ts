import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountsWeightsComponent } from './counts-weights.component';

describe('CountsWeightsComponent', () => {
  let component: CountsWeightsComponent;
  let fixture: ComponentFixture<CountsWeightsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CountsWeightsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountsWeightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
