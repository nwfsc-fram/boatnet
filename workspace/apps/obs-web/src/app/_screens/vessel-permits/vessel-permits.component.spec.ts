import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselPermitsComponent } from './vessel-permits.component';

describe('VesselPermitsComponent', () => {
  let component: VesselPermitsComponent;
  let fixture: ComponentFixture<VesselPermitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VesselPermitsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselPermitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
