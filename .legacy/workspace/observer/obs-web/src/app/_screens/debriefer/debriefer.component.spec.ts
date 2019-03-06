import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebrieferComponent } from './debriefer.component';

describe('DebrieferComponent', () => {
  let component: DebrieferComponent;
  let fixture: ComponentFixture<DebrieferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DebrieferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DebrieferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
