import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLeftoversComponent } from './view-leftovers.component';

describe('ViewLeftoversComponent', () => {
  let component: ViewLeftoversComponent;
  let fixture: ComponentFixture<ViewLeftoversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewLeftoversComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewLeftoversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
