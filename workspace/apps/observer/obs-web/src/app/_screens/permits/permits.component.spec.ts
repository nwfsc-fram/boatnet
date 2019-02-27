import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermitsComponent } from './permits.component';

describe('PermitsComponent', () => {
  let component: PermitsComponent;
  let fixture: ComponentFixture<PermitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PermitsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
