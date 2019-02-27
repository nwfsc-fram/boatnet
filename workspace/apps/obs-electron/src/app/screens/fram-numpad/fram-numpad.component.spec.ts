import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FramNumpadComponent } from './fram-numpad.component';

describe('FramNumpadComponent', () => {
  let component: FramNumpadComponent;
  let fixture: ComponentFixture<FramNumpadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FramNumpadComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FramNumpadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
