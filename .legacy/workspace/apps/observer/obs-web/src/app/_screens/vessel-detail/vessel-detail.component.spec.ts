import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselDetailComponent } from './vessel-detail.component';

describe('VesselDetailComponent', () => {
  let component: VesselDetailComponent;
  let fixture: ComponentFixture<VesselDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VesselDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VesselDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
