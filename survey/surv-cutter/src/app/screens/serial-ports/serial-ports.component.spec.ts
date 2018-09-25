import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SerialPortsComponent } from './serial-ports.component';

describe('SerialPortsComponent', () => {
  let component: SerialPortsComponent;
  let fixture: ComponentFixture<SerialPortsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SerialPortsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SerialPortsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
