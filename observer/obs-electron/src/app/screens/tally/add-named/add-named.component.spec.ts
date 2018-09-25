import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNamedComponent } from './add-named.component';

describe('AddNamedComponent', () => {
  let component: AddNamedComponent;
  let fixture: ComponentFixture<AddNamedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNamedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNamedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
