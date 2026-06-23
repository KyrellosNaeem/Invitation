import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { InvitationBodyComponent } from '../invitation-body/invitation-body.component';

@Component({
  selector: 'app-envelope',
  imports: [CommonModule, InvitationBodyComponent],
  templateUrl: './envelope.component.html',
  styleUrl: './envelope.component.css'
})
export class EnvelopeComponent {
  isOpen = false;
  scrollOffset: number = 0;

  toggleEnvelope(): void {
    if (this.scrollOffset < 1)
      this.isOpen = !this.isOpen;
  }

  onScroll(event: any) {
    const scrollTop = event.target.scrollTop;

    if (this.isOpen)
      this.scrollOffset = scrollTop;
  }
}
