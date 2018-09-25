import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HaulDialogComponent } from './haul-dialog.component';

describe('HaulDialogComponent', () => {
  let component: HaulDialogComponent;
  let fixture: ComponentFixture<HaulDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HaulDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HaulDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
