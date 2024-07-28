import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLeftoverComponent } from './add-leftover.component';

describe('AddLeftoverComponent', () => {
  let component: AddLeftoverComponent;
  let fixture: ComponentFixture<AddLeftoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddLeftoverComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLeftoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
