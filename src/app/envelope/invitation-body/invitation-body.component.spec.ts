import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationBodyComponent } from './invitation-body.component';

describe('InvitationBodyComponent', () => {
  let component: InvitationBodyComponent;
  let fixture: ComponentFixture<InvitationBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitationBodyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitationBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
