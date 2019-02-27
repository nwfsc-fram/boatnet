import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateManagerComponent } from './template-manager.component';

describe('TemplateManagerComponent', () => {
  let component: TemplateManagerComponent;
  let fixture: ComponentFixture<TemplateManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TemplateManagerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
