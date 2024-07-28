import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLeftoversComponent } from './manage-leftovers.component';

describe('ManageLeftoversComponent', () => {
  let component: ManageLeftoversComponent;
  let fixture: ComponentFixture<ManageLeftoversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageLeftoversComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageLeftoversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
