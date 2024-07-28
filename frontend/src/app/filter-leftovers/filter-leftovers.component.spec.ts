import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterLeftoversComponent } from './filter-leftovers.component';

describe('FilterLeftoversComponent', () => {
  let component: FilterLeftoversComponent;
  let fixture: ComponentFixture<FilterLeftoversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterLeftoversComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterLeftoversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
