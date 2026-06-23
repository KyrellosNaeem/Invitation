import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnvelopeComponent } from './envelope/envelope.component';
import { InvitationBodyComponent } from './invitation-body/invitation-body.component';


@NgModule({
  declarations: [
    EnvelopeComponent,
    InvitationBodyComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EnvelopeComponent,
    InvitationBodyComponent
  ]
})
export class EnvelopeModule { }
