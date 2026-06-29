import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InvitationBodyComponent } from '../invitation-body/invitation-body.component';

@Component({
  selector: 'app-envelope',
  standalone: true,
  imports: [CommonModule, InvitationBodyComponent],
  templateUrl: './envelope.component.html',
  styleUrl: './envelope.component.css'
})
export class EnvelopeComponent implements OnInit {
  isOpen = false;
  scrollOffset = 0;
  guestName = 'Friend';
  showInvitation = false;
  dear = 'dear';

  // URL params passed to invitation body
  guestCode  = '';   // ?code=K001
  receptionParam = ''; // ?r=ksar

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.guestCode       = params['c'] ?? '';
      this.receptionParam  = params['r']    ?? '';

      // guestName on flap: will be resolved properly inside invitation-body
      // but we set a placeholder here; invitation-body will emit the real name
      if (!this.guestCode && !this.receptionParam) {
        this.guestName = 'Friend';
      }
    });

    setTimeout(() => {
      this.showInvitation = true;
    }, 3000);
  }

  toggleEnvelope(): void {

  // Allow closing/opening only at the top
  if (this.scrollOffset > 0) {
    return;
  }

  if (!this.isOpen) {
    this.scrollOffset = 150;
  }

  this.isOpen = !this.isOpen;
}

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (this.isOpen) {
      this.scrollOffset = target.scrollTop;
    }
  }

  // Called by invitation-body once it resolves the guest name from the code
  onGuestNameResolved(name: string): void {
    this.guestName = name;
    if (name.toLowerCase().includes('&')) {
      this.dear = 'dears';
    }
  }
}