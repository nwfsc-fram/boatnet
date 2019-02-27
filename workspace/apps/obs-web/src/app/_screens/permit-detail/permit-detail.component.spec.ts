import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermitDetailComponent } from './permit-detail.component';

describe('PermitDetailComponent', () => {
  let component: PermitDetailComponent;
  let fixture: ComponentFixture<PermitDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PermitDetailComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermitDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
