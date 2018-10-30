import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OTSManagementComponent } from './ots-management.component';

describe('OTSManagementComponent', () => {
  let component: OTSManagementComponent;
  let fixture: ComponentFixture<OTSManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OTSManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OTSManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
