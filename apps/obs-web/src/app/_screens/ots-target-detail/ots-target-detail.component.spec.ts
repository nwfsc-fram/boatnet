import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtsTargetDetailComponent } from './ots-target-detail.component';

describe('OtsTargetDetailComponent', () => {
  let component: OtsTargetDetailComponent;
  let fixture: ComponentFixture<OtsTargetDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OtsTargetDetailComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtsTargetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
