import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HaulListComponent } from './haul-list.component';

describe('HaulListComponent', () => {
  let component: HaulListComponent;
  let fixture: ComponentFixture<HaulListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HaulListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HaulListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
