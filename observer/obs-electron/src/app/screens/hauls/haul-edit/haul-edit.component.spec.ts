import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HaulEditComponent } from './haul-edit.component';

describe('HaulEditComponent', () => {
  let component: HaulEditComponent;
  let fixture: ComponentFixture<HaulEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HaulEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HaulEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
