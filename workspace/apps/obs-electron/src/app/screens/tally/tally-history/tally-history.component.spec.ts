import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TallyHistoryComponent } from './tally-history.component';

describe('TallyHistoryComponent', () => {
  let component: TallyHistoryComponent;
  let fixture: ComponentFixture<TallyHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TallyHistoryComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TallyHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
