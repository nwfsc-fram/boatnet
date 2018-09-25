import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HaulsComponent } from './hauls.component';

describe('HaulsComponent', () => {
  let component: HaulsComponent;
  let fixture: ComponentFixture<HaulsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HaulsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HaulsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

